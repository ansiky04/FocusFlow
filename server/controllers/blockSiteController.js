import BlockSite from '../models/BlockSite.js';

/**
 * Retrieve all custom blocked websites configured by the authenticated user.
 * @route GET /api/block-sites
 * @access Private
 */
export const getBlockSites = async (req, res, next) => {
  try {
    const sites = await BlockSite.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: sites.length,
      sites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new website domain to the block list.
 * @route POST /api/block-sites
 * @access Private
 */
export const createBlockSite = async (req, res, next) => {
  const { website, category, enabled } = req.body;

  try {
    if (!website || !website.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Website domain is required'
      });
    }

    // Sanitize the input domain name (remove http, https, and www)
    let domain = website.trim().toLowerCase();
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');

    // Check for duplicate domain configuration for this user
    const existing = await BlockSite.findOne({ userId: req.user._id, website: domain });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This website is already on your block list'
      });
    }

    const site = await BlockSite.create({
      userId: req.user._id,
      website: domain,
      category: category?.trim() || 'General',
      enabled: enabled !== undefined ? enabled : true
    });

    res.status(201).json({
      success: true,
      site
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing blocked website mapping.
 * @route PUT /api/block-sites/:id
 * @access Private
 */
export const updateBlockSite = async (req, res, next) => {
  const { id } = req.params;
  const { website, category, enabled } = req.body;

  try {
    const updateFields = {};
    
    if (website !== undefined) {
      let domain = website.trim().toLowerCase();
      domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');
      updateFields.website = domain;
    }
    
    if (category !== undefined) {
      updateFields.category = category.trim();
    }
    
    if (enabled !== undefined) {
      updateFields.enabled = enabled;
    }

    // Check for duplicate constraint if changing website name
    if (updateFields.website) {
      const duplicate = await BlockSite.findOne({
        userId: req.user._id,
        website: updateFields.website,
        _id: { $ne: id }
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'A blocked website with this domain name already exists'
        });
      }
    }

    const site = await BlockSite.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Blocked website record not found'
      });
    }

    res.status(200).json({
      success: true,
      site
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a website from the block list.
 * @route DELETE /api/block-sites/:id
 * @access Private
 */
export const deleteBlockSite = async (req, res, next) => {
  const { id } = req.params;

  try {
    const site = await BlockSite.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Blocked website record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blocked website removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk sync blocked websites list from extension or web client.
 * @route POST /api/block-sites/sync
 * @access Private
 */
export const syncBlockSites = async (req, res, next) => {
  const { sites } = req.body;

  try {
    if (Array.isArray(sites)) {
      for (const item of sites) {
        if (!item.website) continue;
        let domain = item.website.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
        await BlockSite.findOneAndUpdate(
          { userId: req.user._id, website: domain },
          {
            category: item.category?.trim() || 'General',
            enabled: item.enabled !== undefined ? item.enabled : true
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    const currentSites = await BlockSite.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: currentSites.length,
      sites: currentSites
    });
  } catch (error) {
    next(error);
  }
};


