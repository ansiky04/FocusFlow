/**
 * FocusFlow Focus Shield - Rule Engine Module
 * Production-ready domain, subdomain, and wildcard pattern compiler
 * for Chromium DeclarativeNetRequest dynamic rules (Chrome & Microsoft Edge).
 */

export class RuleEngine {
  /**
   * Sanitize domain or wildcard pattern string
   */
  static sanitizePattern(pattern) {
    if (!pattern) return '';
    let cleaned = pattern.trim().toLowerCase();
    // Strip leading protocols
    cleaned = cleaned.replace(/^(https?:\/\/)/, '');
    // Strip trailing slashes and paths unless part of explicit pattern
    if (!cleaned.includes('*')) {
      cleaned = cleaned.split('/')[0];
    }
    return cleaned;
  }

  /**
   * Check if a given URL string matches a pattern (exact, subdomain, or wildcard)
   */
  static isUrlMatching(urlStr, pattern) {
    if (!urlStr || !pattern) return false;

    try {
      const urlObj = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      const hostname = urlObj.hostname.toLowerCase();
      const sanitized = this.sanitizePattern(pattern);

      // Handle wildcard pattern (*.domain.com, *keyword*, etc.)
      if (sanitized.startsWith('*.')) {
        const baseDomain = sanitized.slice(2).replace(/^www\./, '');
        const hostWithoutWww = hostname.replace(/^www\./, '');
        return hostWithoutWww === baseDomain || hostWithoutWww.endsWith(`.${baseDomain}`);
      }

      if (sanitized.includes('*')) {
        const regexStr = '^' + sanitized
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars except *
          .replace(/\*/g, '.*') + '$';
        const regex = new RegExp(regexStr, 'i');
        return regex.test(hostname) || regex.test(urlObj.href);
      }

      // Exact match or subdomain match
      // e.g. "youtube.com" matches "youtube.com", "m.youtube.com", "music.youtube.com"
      const domainWithoutWww = sanitized.replace(/^www\./, '');
      const hostWithoutWww = hostname.replace(/^www\./, '');

      return (
        hostWithoutWww === domainWithoutWww ||
        hostWithoutWww.endsWith(`.${domainWithoutWww}`)
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if a URL matches any whitelisted allowed websites
   */
  static isWhitelisted(urlStr, allowedWebsites = []) {
    if (!allowedWebsites || allowedWebsites.length === 0) return false;
    return allowedWebsites.some(allowed => this.isUrlMatching(urlStr, allowed));
  }

  /**
   * Build a DeclarativeNetRequest regexFilter compliant with Chrome & Microsoft Edge
   */
  static buildRegexFilter(pattern) {
    const sanitized = this.sanitizePattern(pattern);

    // 1. Wildcard subdomain: *.domain.com
    if (sanitized.startsWith('*.')) {
      const baseDomain = sanitized.slice(2).replace(/^www\./, '');
      const escaped = baseDomain.replace(/\./g, '\\.');
      return `^(https?://(?:[a-zA-Z0-9-]+\\.)*${escaped}(?:[:/].*)?)$`;
    }

    // 2. Generic wildcard (contains *): e.g. *social*, *betting*.com
    if (sanitized.includes('*')) {
      const parts = sanitized.split('*').map(p => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&'));
      const regexPattern = parts.join('[^/]*');
      return `^(https?://(?:[^/]*\\.)?${regexPattern}(?:[:/].*)?)$`;
    }

    // 3. Exact domain and all subdomains: e.g. youtube.com -> matches youtube.com, m.youtube.com, etc.
    const domainWithoutWww = sanitized.replace(/^www\./, '');
    const escapedDomain = domainWithoutWww.replace(/\./g, '\\.');

    return `^(https?://(?:[a-zA-Z0-9-]+\\.)*${escapedDomain}(?:[:/].*)?)$`;
  }

  /**
   * Generate a deterministic, positive 31-bit integer rule ID for a pattern
   */
  static getDeterministicRuleId(pattern, isAllow = false) {
    const sanitized = this.sanitizePattern(pattern);
    let hash = 5381;
    for (let i = 0; i < sanitized.length; i++) {
      hash = ((hash << 5) + hash) + sanitized.charCodeAt(i);
      hash = hash & 0x7FFFFFFF; // Ensure positive 31-bit int
    }
    const baseHash = (Math.abs(hash) % 500000) + 1;
    return isAllow ? baseHash + 1000000 : baseHash;
  }

  /**
   * Generate DeclarativeNetRequest dynamic rules for active shield
   */
  static generateDynamicRules(blockedWebsites = [], allowedWebsites = []) {
    const rules = [];
    const usedRuleIds = new Set();

    // 1. Deduplicate and sanitize allowed websites (including system protection for FocusFlow app/API)
    const systemAppDomains = [
      'focus-flow-flame-one.vercel.app',
      'focusflow-api-aazl.onrender.com',
      'onrender.com',
      'localhost',
      '127.0.0.1'
    ];
    const mergedAllowed = [...(Array.isArray(allowedWebsites) ? allowedWebsites : []), ...systemAppDomains];

    const uniqueAllowed = Array.from(new Set(
      mergedAllowed
        .filter(site => site && typeof site === 'string' && site.trim().length > 0)
        .map(site => this.sanitizePattern(site))
        .filter(site => site.length > 0)
    ));

    // 2. Deduplicate and sanitize blocked websites
    const uniqueBlocked = Array.from(new Set(
      (Array.isArray(blockedWebsites) ? blockedWebsites : [])
        .filter(site => site && typeof site === 'string' && site.trim().length > 0)
        .map(site => this.sanitizePattern(site))
        .filter(site => site.length > 0)
    ));

    let fallbackCounter = 1;

    // 3. Whitelist rules (ALLOW action with higher priority: 2)
    uniqueAllowed.forEach((allowedPattern) => {
      const regexFilter = this.buildRegexFilter(allowedPattern);
      let ruleId = this.getDeterministicRuleId(allowedPattern, true);

      while (usedRuleIds.has(ruleId)) {
        ruleId = 1000000 + (fallbackCounter++);
      }
      usedRuleIds.add(ruleId);

      rules.push({
        id: ruleId,
        priority: 2,
        action: {
          type: "allow"
        },
        condition: {
          regexFilter: regexFilter,
          resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest"]
        }
      });
    });

    // 4. Block & Redirect rules (REDIRECT action with standard priority: 1)
    // Note: In Chrome MV3 DeclarativeNetRequest, regexSubstitution MUST be a root-relative path starting with '/'
    uniqueBlocked.forEach((blockedPattern) => {
      const regexFilter = this.buildRegexFilter(blockedPattern);
      let ruleId = this.getDeterministicRuleId(blockedPattern, false);

      while (usedRuleIds.has(ruleId)) {
        ruleId = fallbackCounter++;
      }
      usedRuleIds.add(ruleId);

      const redirectUrl = `/blocked.html?website=${encodeURIComponent(blockedPattern)}&url=\\1`;

      rules.push({
        id: ruleId,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            regexSubstitution: redirectUrl
          }
        },
        condition: {
          regexFilter: regexFilter,
          resourceTypes: ["main_frame"]
        }
      });
    });

    return rules;
  }
}
