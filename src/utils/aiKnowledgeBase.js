// A curated offline knowledge base of 100+ predefined response items across 25 categories.
export const KNOWLEDGE_BASE = [
  // 1. Algorithms
  {
    category: 'Algorithms',
    keywords: ['binary search', 'binarysearch', 'bin search'],
    response: "Binary Search is an efficient O(log n) algorithm for finding an element in a sorted list. It works by repeatedly dividing the search space in half. If the target value is less than the middle element, it narrows the search interval to the lower half; otherwise, to the upper half."
  },
  {
    category: 'Algorithms',
    keywords: ['bubble sort', 'bubblesort'],
    response: "Bubble Sort is a simple O(n^2) sorting algorithm that works by repeatedly swapping adjacent elements if they are in the wrong order. It is stable but highly inefficient on larger datasets."
  },
  {
    category: 'Algorithms',
    keywords: ['quick sort', 'quicksort', 'pivot sort'],
    response: "Quick Sort is a divide-and-conquer algorithm with an average complexity of O(n log n). It selects a 'pivot' element and partitions the array such that elements smaller than the pivot go to the left, and larger elements go to the right."
  },
  {
    category: 'Algorithms',
    keywords: ['merge sort', 'mergesort'],
    response: "Merge Sort is a stable, divide-and-conquer O(n log n) sorting algorithm. It splits the array in half, recursively sorts each half, and then merges the sorted halves back together."
  },
  {
    category: 'Algorithms',
    keywords: ['dijkstra', 'shortest path', 'dijkstras algorithm'],
    response: "Dijkstra's Algorithm finds the shortest path from a single source node to all other nodes in a weighted, non-negative directed or undirected graph using a greedy approach, executing in O(V^2) or O(E + V log V) with a priority queue."
  },

  // 2. Data Structures
  {
    category: 'Data Structures',
    keywords: ['array', 'arrays'],
    response: "An Array is a linear data structure that stores elements of the same data type in contiguous memory locations. It provides O(1) time complexity for access by index, but search, insertion, and deletion are O(n)."
  },
  {
    category: 'Data Structures',
    keywords: ['linked list', 'linkedlist', 'doubly linked list'],
    response: "A Linked List is a linear data structure where elements (nodes) are linked using pointers. Dynamic sizing allows O(1) insertions/deletions at known positions, but random access is slow at O(n)."
  },
  {
    category: 'Data Structures',
    keywords: ['stack', 'stacks', 'lifo'],
    response: "A Stack is a LIFO (Last In, First Out) linear data structure. Core operations are push (adds an element to the top) and pop (removes the top element), executing in O(1) time."
  },
  {
    category: 'Data Structures',
    keywords: ['queue', 'queues', 'fifo'],
    response: "A Queue is a FIFO (First In, First Out) linear data structure. Elements are inserted at the rear (enqueue) and removed from the front (dequeue) in O(1) time."
  },
  {
    category: 'Data Structures',
    keywords: ['tree', 'trees', 'binary tree', 'bst'],
    response: "A Tree is a non-linear, hierarchical structure consisting of nodes connected by edges, starting from a root. Binary Search Trees (BST) maintain order: left children are smaller than parent, right children are larger."
  },
  {
    category: 'Data Structures',
    keywords: ['hash table', 'hashtable', 'hash map', 'hashmap'],
    response: "A Hash Table maps keys to values using a hashing function, offering O(1) average time complexity for lookup, insertion, and deletion operations by utilizing key indexing."
  },
  {
    category: 'Data Structures',
    keywords: ['graph', 'graphs', 'directed graph'],
    response: "A Graph is a non-linear data structure consisting of nodes (vertices) and connections (edges). Used to model complex networks, they are searched using Depth-First Search (DFS) or Breadth-First Search (BFS)."
  },

  // 3. Software Engineering
  {
    category: 'Software Engineering',
    keywords: ['mvc', 'model view controller'],
    response: "MVC (Model-View-Controller) is an architectural pattern. The Model handles data/logic, the View handles UI display, and the Controller listens to inputs and commands updates to both."
  },
  {
    category: 'Software Engineering',
    keywords: ['agile', 'scrum', 'kanban'],
    response: "Agile is an iterative software development methodology emphasizing collaboration, frequent releases, sprint planning, and adapting to customer requirements dynamically."
  },
  {
    category: 'Software Engineering',
    keywords: ['git', 'version control', 'github', 'gitlab'],
    response: "Git is a distributed version control system. It allows multiple developers to track source code history, branch features, merge revisions, and collaborate safely without overwriting work."
  },
  {
    category: 'Software Engineering',
    keywords: ['cicd', 'continuous integration', 'jenkins', 'actions'],
    response: "CI/CD (Continuous Integration/Continuous Delivery) automates building, testing, and deploying code as commits are pushed, reducing manual errors and speeding up release cycles."
  },
  {
    category: 'Software Engineering',
    keywords: ['design patterns', 'singleton', 'factory pattern'],
    response: "Design Patterns are reusable, standard solutions to common software design problems. They are categorized into Creational (e.g. Singleton), Structural (e.g. Adapter), and Behavioral (e.g. Observer)."
  },
  {
    category: 'Software Engineering',
    keywords: ['microservices', 'monolith'],
    response: "Microservices is an architectural style that splits an application into small, autonomous, loosely coupled services communicating via APIs, contrasting with single-codebase Monolith layouts."
  },

  // 4. DBMS
  {
    category: 'DBMS',
    keywords: ['sql', 'relational database', 'rdbms', 'mysql', 'postgres'],
    response: "SQL (Structured Query Language) is used to manage relational databases. It supports structured data storage, joins, query commands, transactions, and rigid schemas."
  },
  {
    category: 'DBMS',
    keywords: ['nosql', 'nonrelational database'],
    response: "NoSQL databases store unstructured or semi-structured data using models like document arrays (MongoDB), key-value maps (Redis), column stores, or graph trees."
  },
  {
    category: 'DBMS',
    keywords: ['acid', 'database transaction', 'isolation level'],
    response: "ACID stands for Atomicity (all-or-nothing), Consistency (integrity rules), Isolation (independent execution), and Durability (saved changes)—guaranteeing reliable database transactions."
  },
  {
    category: 'DBMS',
    keywords: ['indexing', 'db index'],
    response: "Indexing is a database technique that creates lookup files to speed up queries at the expense of slower writes and additional disk space."
  },
  {
    category: 'DBMS',
    keywords: ['normalization', 'normal form', 'db normalization'],
    response: "Normalization is the process of structuring relational tables to reduce data redundancy, split large sets, and ensure correct data dependencies."
  },
  {
    category: 'DBMS',
    keywords: ['primary key', 'foreign key'],
    response: "A Primary Key uniquely identifies a record in a table and cannot contain null values. A Foreign Key is a field in one table that links to the primary key of another table, enforcing referential integrity."
  },

  // 5. Operating Systems
  {
    category: 'Operating Systems',
    keywords: ['process', 'processes'],
    response: "A Process is an active instance of a running program, containing memory sections (code, data, heap, stack) and managed independently by the operating system."
  },
  {
    category: 'Operating Systems',
    keywords: ['thread', 'threads', 'multithreading'],
    response: "A Thread is the smallest unit of CPU execution inside a process. Threads in the same process share code, memory, and descriptors, making context switching cheaper than process switching."
  },
  {
    category: 'Operating Systems',
    keywords: ['deadlock', 'deadlocks'],
    response: "A Deadlock occurs when two or more processes are blocked forever, each holding a resource the other needs. Conditions for deadlock: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait."
  },
  {
    category: 'Operating Systems',
    keywords: ['virtual memory', 'swap memory'],
    response: "Virtual Memory extends physical RAM memory by mapping program addresses to disk blocks, allowing execution of apps larger than physical memory size."
  },
  {
    category: 'Operating Systems',
    keywords: ['paging', 'pages', 'page fault'],
    response: "Paging divides logical memory into fixed-size blocks (pages) and physical memory into frames. A Page Fault triggers when the CPU requests a page not currently mapped in RAM, forcing disk fetch."
  },
  {
    category: 'Operating Systems',
    keywords: ['cpu scheduling', 'round robin', 'fcfs'],
    response: "CPU Scheduling is how the OS allocates CPU time to active threads. Popular policies include First-Come First-Served (FCFS), Shortest Job First (SJF), and Round Robin (RR)."
  },

  // 6. Computer Networks
  {
    category: 'Computer Networks',
    keywords: ['tcp/ip', 'tcp', 'udp'],
    response: "TCP/IP is a networking protocol suite. TCP provides reliable, error-checked, connection-oriented packet delivery via handshakes, whereas UDP is lightweight, connectionless, and fast."
  },
  {
    category: 'Computer Networks',
    keywords: ['dns', 'domain name system'],
    response: "DNS (Domain Name System) translates human-friendly web address URLs (like focusflow.app) into numerical machine IP addresses (like 192.168.1.1) to navigate networks."
  },
  {
    category: 'Computer Networks',
    keywords: ['ip address', 'ipv4', 'ipv6'],
    response: "An IP (Internet Protocol) Address is a unique numerical identifier assigned to devices on a network. IPv4 uses 32-bit addresses, while IPv6 uses 128-bit addresses to handle device capacity."
  },
  {
    category: 'Computer Networks',
    keywords: ['http', 'https', 'hypertext transfer protocol'],
    response: "HTTP is the application-layer protocol for web clients and servers to exchange data. HTTPS encrypts HTTP communication using TLS/SSL to safeguard user privacy."
  },
  {
    category: 'Computer Networks',
    keywords: ['router', 'routing'],
    response: "A Router is a layer 3 network device that forwards data packets between computer networks using headers and routing tables to determine the best path."
  },
  {
    category: 'Computer Networks',
    keywords: ['switch', 'switches'],
    response: "A Switch is a layer 2 network device that connects devices inside a Local Area Network (LAN) using MAC addresses to forward data frames to specific destination ports."
  },
  {
    category: 'Computer Networks',
    keywords: ['osi model', 'osi layers'],
    response: "The OSI Model is a 7-layer networking blueprint: Physical, Data Link, Network, Transport, Session, Presentation, and Application. It helps standardize network engineering."
  },

  // 7. Java
  {
    category: 'Java',
    keywords: ['jvm', 'jre', 'jdk'],
    response: "The JVM (Java Virtual Machine) executes Java bytecode, enabling write-once-run-anywhere cross-platform compatibility. JDK is the compiler kit; JRE is the runtime environment."
  },
  {
    category: 'Java',
    keywords: ['garbage collection', 'gc java'],
    response: "Garbage Collection in Java is the automated memory management daemon that monitors heap allocations and deletes objects that have lost reference chains."
  },
  {
    category: 'Java',
    keywords: ['oop', 'object oriented programming'],
    response: "OOP is a paradigm based on 'objects' containing data and logic. It rests on four pillars: Encapsulation (hiding data), Abstraction (hiding details), Inheritance (reusing code), and Polymorphism (methods with many forms)."
  },
  {
    category: 'Java',
    keywords: ['multithreading in java', 'runnable interface', 'thread class'],
    response: "Java achieves multithreading by extending the Thread class or implementing the Runnable interface, utilizing synchronized blocks to control thread concurrency."
  },
  {
    category: 'Java',
    keywords: ['inheritance java', 'extends'],
    response: "In Java, inheritance allows a subclass to acquire the fields and methods of a parent class using the 'extends' keyword. Java supports single inheritance only for classes."
  },

  // 8. Python
  {
    category: 'Python',
    keywords: ['list comprehension python', 'list comprehensions'],
    response: "List Comprehensions provide a concise way to create lists in Python, e.g., `squares = [x**2 for x in range(10)]`. They are generally faster and more readable than standard for loops."
  },
  {
    category: 'Python',
    keywords: ['gil', 'global interpreter lock'],
    response: "The GIL (Global Interpreter Lock) in CPython prevents multiple native threads from executing Python bytecodes concurrently. This restricts multi-core utilization to processes instead of threads."
  },
  {
    category: 'Python',
    keywords: ['decorator', 'decorators python'],
    response: "A Decorator in Python is a design wrapper that allows developers to dynamically modify or audit a function's execution behaviour without altering its underlying code statements."
  },
  {
    category: 'Python',
    keywords: ['virtual environment', 'venv', 'pipenv'],
    response: "A Python Virtual Environment (venv) isolates package dependencies for individual projects, preventing system-wide package version conflicts."
  },
  {
    category: 'Python',
    keywords: ['pep 8', 'pep8', 'python coding style'],
    response: "PEP 8 is the official Python Enhancement Proposal style guide. It advises on indentations (4 spaces), variable naming patterns, and comment layouts to improve readability."
  },

  // 9. C Programming
  {
    category: 'C Programming',
    keywords: ['pointer c', 'pointers c', 'dereference'],
    response: "A Pointer in C stores the direct memory address of another variable. Core operators: `&` returns address, `*` dereferences address to retrieve values."
  },
  {
    category: 'C Programming',
    keywords: ['struct', 'structures c'],
    response: "A Struct in C is a user-defined composite data type grouping related variables of different types under a single variable block."
  },
  {
    category: 'C Programming',
    keywords: ['malloc', 'calloc', 'free memory'],
    response: "Functions like malloc() and calloc() dynamically allocate heap memory during runtime. Always call free() when finished to prevent memory leaks."
  },
  {
    category: 'C Programming',
    keywords: ['compilation c', 'preprocessing', 'linking c'],
    response: "C compilation flows through 4 stages: Preprocessing (macro expand), Compilation (to assembler code), Assembly (to object files), and Linking (to final executable binary)."
  },
  {
    category: 'C Programming',
    keywords: ['header file', 'include file', 'header files c'],
    response: "Header Files (.h) contain declarations of functions, macros, and structures shared across source modules. Imported using the `#include` preprocessor directive."
  },

  // 10. HTML
  {
    category: 'HTML',
    keywords: ['semantic html', 'semantic elements'],
    response: "Semantic HTML uses meaningful tags (like article, section, aside, header) instead of plain divs, making web page markup more accessible and SEO-friendly."
  },
  {
    category: 'HTML',
    keywords: ['dom', 'document object model'],
    response: "The DOM is a structural node tree representing HTML layouts. Javascript API methods manipulate the DOM to dynamically edit element contents, layouts, and styles."
  },
  {
    category: 'HTML',
    keywords: ['anchor tag', 'hyperlink html', 'target blank'],
    response: "The anchor tag `<a>` defines hyperlinks. The `href` attribute declares the target destination; using `target='_blank'` opens links in new browser tabs."
  },
  {
    category: 'HTML',
    keywords: ['iframe', 'inline frame'],
    response: "An iframe embeds another HTML document inside the current webpage, commonly used to display maps, external widgets, or media players."
  },
  {
    category: 'HTML',
    keywords: ['form html', 'input tags', 'submit form'],
    response: "HTML Forms collect user input via tag controls (like input, select, textarea) and submit data using GET/POST request methods."
  },

  // 11. CSS
  {
    category: 'CSS',
    keywords: ['flexbox', 'flex direction', 'justify content'],
    response: "Flexbox is a 1D layout model for organizing elements in a single row or column. It dynamically manages alignments, wrapping, and spaces between sibling nodes."
  },
  {
    category: 'CSS',
    keywords: ['css grid', 'grid template'],
    response: "CSS Grid is a 2D layout model designed to split pages into rows and columns, enabling complicated layout structures without absolute positioning rules."
  },
  {
    category: 'CSS',
    keywords: ['css specificity', 'specificity rules'],
    response: "Specificity determines which CSS styling rule overrides others. Inline styling is highest (1000), followed by IDs (100), Classes (10), and element selectors (1)."
  },
  {
    category: 'CSS',
    keywords: ['media queries', 'media query responsive'],
    response: "Media Queries apply specific CSS styles based on device viewport widths, orientation, or pixel densities, enabling responsive layout designs."
  },
  {
    category: 'CSS',
    keywords: ['css variables', 'custom properties css'],
    response: "CSS Variables declare reusable value tokens, e.g. `--primary-color: #6366f1;`, accessed anywhere using the `var()` utility function."
  },

  // 12. JavaScript
  {
    category: 'JavaScript',
    keywords: ['closure', 'closures javascript'],
    response: "A Closure is a function that retains references to its outer scope variables even after that outer function has finished executing."
  },
  {
    category: 'JavaScript',
    keywords: ['promise', 'promises js', 'async await'],
    response: "A Promise is an object representing asynchronous results. Resolving or rejecting states are handled with `.then()/.catch()` or using synchronous `async/await` syntax."
  },
  {
    category: 'JavaScript',
    keywords: ['event loop javascript', 'task queue', 'call stack js'],
    response: "The Event Loop manages JS execution by feeding execution threads from the callback queue onto the call stack when the stack is empty."
  },
  {
    category: 'JavaScript',
    keywords: ['hoisting', 'hoisted js'],
    response: "Hoisting moves variable and function declarations to the top of their enclosing scope prior to executing the code statements."
  },
  {
    category: 'JavaScript',
    keywords: ['arrow functions', 'lexical this'],
    response: "Arrow Functions (`=>`) provide a shorter syntax and bind the `this` keyword lexically, inherit-locking it from the context they were declared in."
  },

  // 13. React
  {
    category: 'React',
    keywords: ['virtual dom react', 'reconciliation react'],
    response: "React maintains a lightweight copy of the UI called the Virtual DOM. It calculates changes (diffing) and performs updates on the real browser DOM all at once, improving rendering speeds."
  },
  {
    category: 'React',
    keywords: ['react hooks', 'use state', 'use effect hook'],
    response: "React Hooks let you use state and other React features in functional components. `useState` stores mutable variables; `useEffect` controls rendering side effects."
  },
  {
    category: 'React',
    keywords: ['state vs props', 'props react'],
    response: "Props are read-only configuration inputs passed down from parent to child components. State is local, private data managed inside a component that updates dynamically."
  },
  {
    category: 'React',
    keywords: ['useeffect cleanup', 'dependency array'],
    response: "The useEffect dependency array decides when side-effects run. Returning a function inside the callback registers a cleanup subroutine executed when components unmount."
  },
  {
    category: 'React',
    keywords: ['react lifecycle', 'component did mount'],
    response: "React Component Lifecycles involve Mounting (rendered into DOM), Updating (updating state/props), and Unmounting (removed from DOM)."
  },

  // 14. MongoDB
  {
    category: 'MongoDB',
    keywords: ['mongodb document', 'bson format'],
    response: "MongoDB documents represent basic record blocks, structured in BSON (Binary JSON) format supporting nested arrays and embedded objects."
  },
  {
    category: 'MongoDB',
    keywords: ['mongodb collection', 'mongo collections'],
    response: "A Collection is a grouping of documents inside MongoDB, equivalent to tables in relational databases, but without mandatory schemas."
  },
  {
    category: 'MongoDB',
    keywords: ['indexing mongodb', 'mongo indexes'],
    response: "Mongo Indexes allow search engines to inspect smaller datasets rather than scanning entire collections, speeding up query execution."
  },
  {
    category: 'MongoDB',
    keywords: ['aggregation pipeline mongodb', 'mongo aggregate'],
    response: "MongoDB Aggregations process document collections in stages (like $match, $group, $sort) to compile calculations and transform databases."
  },
  {
    category: 'MongoDB',
    keywords: ['mongoose schema', 'mongoose model'],
    response: "Mongoose is a Node.js object modeling library for MongoDB. It provides validation and validation rules through schemas."
  },

  // 15. Node.js
  {
    category: 'Node.js',
    keywords: ['node event loop', 'libuv node'],
    response: "Node.js runs on a single thread using an event loop built on the libuv library, offloading file system or network tasks to background worker pools."
  },
  {
    category: 'Node.js',
    keywords: ['npm modules', 'node package manager'],
    response: "NPM is Node's package manager, housing reusable libraries. Developers run `npm install <package>` to add dependencies to their workspace."
  },
  {
    category: 'Node.js',
    keywords: ['package json scripts', 'package lock'],
    response: "The package.json declares details of projects, scripts, and runtime dependencies. The package-lock.json locks exact sub-dependency versions."
  },
  {
    category: 'Node.js',
    keywords: ['node streams', 'stream read write'],
    response: "Streams process data chunks incrementally, which avoids reading huge files into memory all at once."
  },
  {
    category: 'Node.js',
    keywords: ['node buffer', 'buffer class node'],
    response: "Buffers manage raw binary sequences, allocating memory buffers outside V8 heaps, crucial for networking operations."
  },

  // 16. Express.js
  {
    category: 'Express.js',
    keywords: ['express middleware', 'app use middleware'],
    response: "Express middlewares are callbacks executing during request-response cycles. They receive req, res, and call `next()` to hand over control."
  },
  {
    category: 'Express.js',
    keywords: ['express routing', 'express route parameters'],
    response: "Express Routing maps client requests (GET, POST, PUT, DELETE) to specific URI paths and handles variable parameters like `/user/:id` via `req.params`."
  },
  {
    category: 'Express.js',
    keywords: ['express router class', 'modular routes express'],
    response: "The `express.Router` class creates modular, mini route controllers that group API subroutes cleanly."
  },
  {
    category: 'Express.js',
    keywords: ['express body parser', 'req body express'],
    response: "Body-parsers (like the built-in `express.json()`) parse incoming payload bodies into JSON, making inputs available under `req.body`."
  },

  // 17. AI
  {
    category: 'AI',
    keywords: ['artificial intelligence definition', 'what is ai'],
    response: "Artificial Intelligence is the branch of computer science focused on building software systems capable of mimicking human reasoning, learning, and decision-making."
  },
  {
    category: 'AI',
    keywords: ['nlp machine learning', 'natural language processing'],
    response: "NLP (Natural Language Processing) is an AI subfield that allows software programs to parse, translate, tokenise, and interpret human sentences."
  },
  {
    category: 'AI',
    keywords: ['neural network layers', 'neurons ai'],
    response: "A Neural Network is an AI model consisting of interconnected processing nodes (neurons) organized in Input, Hidden, and Output layers."
  },
  {
    category: 'AI',
    keywords: ['deep learning networks', 'artificial neural networks DL'],
    response: "Deep Learning is a subset of ML utilizing deep multi-layer neural networks capable of learning abstract features directly from large datasets."
  },

  // 18. Machine Learning
  {
    category: 'Machine Learning',
    keywords: ['supervised learning supervised ml'],
    response: "Supervised Learning trains models using labeled training data containing input-output pairs to predict future labels."
  },
  {
    category: 'Machine Learning',
    keywords: ['unsupervised learning clustering'],
    response: "Unsupervised Learning trains models on unlabeled data, finding hidden patterns or groupings (clustering) automatically."
  },
  {
    category: 'Machine Learning',
    keywords: ['linear regression equation'],
    response: "Linear Regression is an ML algorithm that models the linear relationship between a dependent variable and one or more independent features."
  },
  {
    category: 'Machine Learning',
    keywords: ['overfitting train test', 'overfitted model'],
    response: "Overfitting occurs when an ML model learns the training data's noise, leading to poor generalization on unseen testing data."
  },
  {
    category: 'Machine Learning',
    keywords: ['underfitting model simplicity', 'underfitted model'],
    response: "Underfitting occurs when an ML model is too simple to capture the underlying patterns, performing poorly on both training and test data."
  },

  // 19. Study Techniques
  {
    category: 'Study Techniques',
    keywords: ['pomodoro technique study', 'pomodoro focus session'],
    response: "The Pomodoro Technique breaks study intervals into 25-minute focus sessions followed by 5-minute short break windows."
  },
  {
    category: 'Study Techniques',
    keywords: ['spaced repetition flashcards', 'forgetting curve spaced'],
    response: "Spaced Repetition schedules concept reviews at increasing intervals to move knowledge from short-term to long-term memory."
  },
  {
    category: 'Study Techniques',
    keywords: ['feynman technique simple', 'feynman explain concepts'],
    response: "The Feynman Technique involves explaining a complex concept in simple language to identify gaps in your understanding."
  },
  {
    category: 'Study Techniques',
    keywords: ['timeboxing plan calendar', 'timebox tasks'],
    response: "Time Boxing allocates a fixed time block to a task in advance, preventing procrastination and hyper-focusing."
  },

  // 20. Time Management
  {
    category: 'Time Management',
    keywords: ['eisenhower matrix prioritization', 'eisenhower quadrants'],
    response: "The Eisenhower Matrix divides tasks into four quadrants: Urgent & Important, Important & Not Urgent, Urgent & Not Important, and Neither."
  },
  {
    category: 'Time Management',
    keywords: ['eat the frog first', 'frog task'],
    response: "Eat the Frog is a productivity tip advising you to tackle your most complex or high-priority task first thing in the morning."
  },
  {
    category: 'Time Management',
    keywords: ['parkinsons law time', 'work expands parkinson'],
    response: "Parkinson's Law states that work expands to fill the time available for its completion. Setting shorter deadlines keeps you focused."
  },
  {
    category: 'Time Management',
    keywords: ['pomodoro breaks routine', 'break period activity'],
    response: "During Pomodoro breaks, avoid screens. Walk, hydrate, or stretch to let your brain restore cognitive stamina."
  },

  // 21. Motivation
  {
    category: 'Motivation',
    keywords: ['study motivation quotes', 'lack of motivation'],
    response: "Motivation gets you started; habit keeps you going. Start with a tiny, 5-minute study sprint to build focus momentum."
  },
  {
    category: 'Motivation',
    keywords: ['handling failure code', 'failure feedback coding'],
    response: "Failure is feedback. When a test or build fails, look at the error log, identify the gap, and iterate. That is how programmers grow."
  },
  {
    category: 'Motivation',
    keywords: ['starting simple tasks', 'writing one line code'],
    response: "If a task feels overwhelming, break it down. Writing one line of code is infinitely better than writing zero lines of code."
  },
  {
    category: 'Motivation',
    keywords: ['motivate', 'motivation quote', 'inspire me'],
    response: "Focus is a muscle, and you are building it right now. Lock in for the next 25 minutes!"
  },

  // 22. Productivity
  {
    category: 'Productivity',
    keywords: ['deep work concentration', 'deep work scheduling'],
    response: "Deep Work is the ability to focus without distraction on a cognitively demanding task, maximizing output per hour."
  },
  {
    category: 'Productivity',
    keywords: ['distraction blocking environment', 'blocking phone study'],
    response: "Keep your workspace clean. Put your phone in another room or use website blockers to minimize multitasking."
  },
  {
    category: 'Productivity',
    keywords: ['soundscapes focus audio', 'ambient noises flow'],
    response: "Ambient audio (lofi beats, rain sounds, white noise) masks background sounds and triggers focus flow states."
  },
  {
    category: 'Productivity',
    keywords: ['sleep hygiene memory', 'sleep length coding'],
    response: "Getting 7-8 hours of quality sleep clears brain toxins and solidifies memory consolidation from yesterday's study sessions."
  },

  // 23. Interview Preparation
  {
    category: 'Interview Preparation',
    keywords: ['resume tips developers', 'star method resume'],
    response: "Structure your resume with the STAR method (Situation, Task, Action, Result). Quantify accomplishments, e.g., 'Optimized query speeds by 40%'."
  },
  {
    category: 'Interview Preparation',
    keywords: ['system design review', 'system design architect'],
    response: "In system design interviews, clarify scope, design high-level components (API, database, cache), and detail bottlenecks."
  },
  {
    category: 'Interview Preparation',
    keywords: ['leetcode advice practice', 'coding pattern preparation'],
    response: "Don't just memorize solutions. Focus on underlying patterns (two pointers, sliding window, DFS/BFS) to solve unseen problems."
  },
  {
    category: 'Interview Preparation',
    keywords: ['mock interviews practice', 'explain thought process code'],
    response: "Practice explaining your thought process out loud while writing code. Communication is just as important as code correctness."
  },

  // 24. Aptitude
  {
    category: 'Aptitude',
    keywords: ['quantitative aptitude topics', 'quant formulas placement'],
    response: "Quantitative aptitude tests mathematical ability. Master percentage, ratio, averages, and time-work-speed formulas."
  },
  {
    category: 'Aptitude',
    keywords: ['logical reasoning puzzles', 'reasoning questions coding'],
    response: "Logical reasoning maps patterns. Practice syllogisms, blood relations, seating arrangements, and coding-decoding puzzles."
  },
  {
    category: 'Aptitude',
    keywords: ['verbal ability test', 'verbal english vocabulary'],
    response: "Improve verbal ability by reading tech blogs, practicing grammar questions, and solving reading comprehension sections."
  },
  {
    category: 'Aptitude',
    keywords: ['aptitude practice tips', 'timed tests placement'],
    response: "Practice aptitude questions under timed conditions to improve your speed and accuracy during placements."
  },

  // 25. General Computer Science
  {
    category: 'General Computer Science',
    keywords: ['binary representation numbers', 'why computers use binary'],
    response: "Computers use binary states (0 and 1) because transistors act as electronic switches that are either off or on."
  },
  {
    category: 'General Computer Science',
    keywords: ['compiler role compiler c', 'compiled vs interpreted'],
    response: "A Compiler translates high-level human-readable source code (like C++) directly into low-level machine code executables."
  },
  {
    category: 'General Computer Science',
    keywords: ['operating system role os purpose', 'os kernel software'],
    response: "An OS manages computer hardware, allocates CPU time and RAM memory, and provides services for software execution."
  },
  {
    category: 'General Computer Science',
    keywords: ['ide tools', 'integrated development environment ide'],
    response: "An IDE (Integrated Development Environment) consolidates code editing, building, debugging, and linting tools in one interface."
  },
  {
    category: 'General Computer Science',
    keywords: ['rest api design', 'restful web services api'],
    response: "A REST API is an architectural style that allows client-server communication using HTTP standard methods like GET, POST, PUT, and DELETE."
  }
];

/**
 * Searches the offline knowledge base for keywords inside the query.
 * If multiple keywords match, score them and return the highest-scoring response.
 * Fallback message returned if no keywords are matched.
 *
 * @param {string} query - The user query to parse
 * @returns {string} - The best matching response or fallback warning
 */
export function getOfflineResponse(query) {
  if (!query) return '';
  const cleanQuery = query.toLowerCase().trim();

  let bestMatch = null;
  let maxScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (cleanQuery.includes(kw)) {
        // Boost score based on keyword length to prefer specific matches
        score += kw.length;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = entry.response;
    }
  }

  if (maxScore > 0 && bestMatch) {
    return bestMatch;
  }

  // Fallback response for un-matched queries
  return "I don't know the answer yet. This offline assistant currently supports Computer Science and productivity topics. Real AI support will be added after backend integration.";
}
