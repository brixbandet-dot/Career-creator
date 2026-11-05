// All game content: zones (levels), their real-world quests, quiz questions and boss projects.
// Text is kept short on purpose: short sentences are easier to read and to listen to.

export const ZONES = {
  py: {
    icon: '🐍', name: 'Python Island', months: 'Month 1 to 2', color: 0x7fc8a9,
    blurb: 'Learn to write code. Both career paths start here.',
    quests: [
      { id: 'py1', t: 'Install Python', d: 'Install Python. Then make it print "Hello, world!"', xp: 25, link: 'https://www.python.org/downloads/', ll: 'python.org' },
      { id: 'py2', t: 'Watch CS50 Python, lecture 0', d: 'A free beginner course from Harvard. Watch lecture 0 and try the practice set.', xp: 40, link: 'https://cs50.harvard.edu/python/', ll: 'CS50 Python' },
      { id: 'py3', t: 'Learn if and loops', d: 'Watch lectures 1 and 2. "if" makes choices. "for" repeats things.', xp: 50, link: 'https://cs50.harvard.edu/python/', ll: 'CS50 Python' },
      { id: 'py4', t: 'Learn errors and libraries', d: 'Watch lectures 3 and 4. Learn to fix errors and use code others wrote.', xp: 50, link: 'https://cs50.harvard.edu/python/', ll: 'CS50 Python' },
      { id: 'py5', t: 'Solve 5 small puzzles', d: 'Short code puzzles with help. Code a little every day.', xp: 40, link: 'https://exercism.org/tracks/python', ll: 'Exercism' },
    ],
    boss: { id: 'pyB', t: 'Build a to-do app', d: 'Make a program that saves your list to a file. It shows the list again next time you run it.', xp: 150 },
    badge: 'Pythonista',
    quiz: [
      { id: 'pyq1', q: 'What does print(len("hello")) show?', o: ['hello', '5', 'len'], a: 1, w: 'len counts the letters. hello has 5.' },
      { id: 'pyq2', q: 'Which word repeats code for each item?', o: ['if', 'for', 'def'], a: 1, w: '"for" runs the code once for each item.' },
      { id: 'pyq3', q: 'What is ["a", "b"] in Python?', o: ['A list', 'A word', 'A function'], a: 0, w: 'Square brackets make a list.' },
    ],
  },
  tools: {
    icon: '🛠️', name: 'Toolsmith Forge', months: 'Month 3', color: 0xe0a46b,
    blurb: 'Learn the tools every developer uses each day.',
    quests: [
      { id: 't1', t: 'Learn 5 terminal commands', d: 'Learn cd, ls, mkdir, pwd, and how to run a Python file.', xp: 40, link: 'https://www.learnenough.com/command-line-tutorial', ll: 'Terminal guide' },
      { id: 't2', t: 'Install VS Code', d: 'A free code editor. Add the Python extension.', xp: 25, link: 'https://code.visualstudio.com/', ll: 'VS Code' },
      { id: 't3', t: 'Play Learn Git Branching', d: 'A picture game that teaches Git.', xp: 50, link: 'https://learngitbranching.js.org/', ll: 'Learn Git Branching' },
      { id: 't4', t: 'Put code on GitHub', d: 'Make a repo. Save a file. Push it to GitHub.', xp: 50, link: 'https://docs.github.com/en/get-started/start-your-journey/hello-world', ll: 'GitHub guide' },
      { id: 't5', t: 'Write a README', d: 'Say what your project does and how to run it.', xp: 30, link: 'https://www.makeareadme.com/', ll: 'README guide' },
    ],
    boss: { id: 'toolsB', t: 'Share your to-do app', d: 'Put your to-do app on GitHub with a README. This is your first portfolio project.', xp: 120 },
    badge: 'Version Controller',
    quiz: [
      { id: 'tq1', q: 'What does git commit do?', o: ['Sends code to GitHub', 'Saves your changes on your computer', 'Deletes files'], a: 1, w: 'commit saves. push sends it to GitHub.' },
      { id: 'tq2', q: 'What does cd do?', o: ['Changes folder', 'Copies a file', 'Closes the window'], a: 0, w: 'cd moves you into another folder.' },
      { id: 'tq3', q: 'Where do you explain your project?', o: ['In the README', 'Nowhere', 'In a secret file'], a: 0, w: 'The README is the first thing people read.' },
    ],
  },
  api: {
    icon: '⚓', name: 'API Harbor', months: 'Month 3 to 4', color: 0x6fb3d9,
    blurb: 'Programs talk to each other with APIs. AI models work this way too.',
    quests: [
      { id: 'a1', t: 'Learn what an API is', d: 'Use Python to get data from a website.', xp: 40, link: 'https://realpython.com/python-requests/', ll: 'Real Python' },
      { id: 'a2', t: 'Get the weather in Python', d: 'Open-Meteo is free. Print the temperature where you live.', xp: 50, link: 'https://open-meteo.com/', ll: 'Open-Meteo' },
      { id: 'a3', t: 'Learn JSON', d: 'JSON is how programs send data to each other.', xp: 40, link: 'https://realpython.com/python-json/', ll: 'Real Python' },
      { id: 'a4', t: 'Make your own small API', d: 'Use FastAPI to make a page that sends back data.', xp: 60, link: 'https://fastapi.tiangolo.com/tutorial/', ll: 'FastAPI' },
    ],
    boss: { id: 'apiB', t: 'Build a weather app', d: 'Get real data from an API and show it nicely. Put it on GitHub.', xp: 150 },
    badge: 'API Whisperer',
    quiz: [
      { id: 'aq1', q: 'What does error 404 mean?', o: ['It worked', 'Not found', 'Too busy'], a: 1, w: '404 means the page is not there.' },
      { id: 'aq2', q: 'Which request gets data?', o: ['GET', 'POST', 'DELETE'], a: 0, w: 'GET reads data. POST sends new data.' },
      { id: 'aq3', q: 'What is JSON?', o: ['A language', 'A way to write data as text', 'A game'], a: 1, w: 'JSON stores data as text that programs can read.' },
    ],
  },
  ai: {
    icon: '🤖', name: 'Model Valley', months: 'Month 4 to 6', color: 0xa48fe0,
    blurb: 'Use AI models in your own programs.',
    quests: [
      { id: 'm1', t: 'Learn to write good prompts', d: 'A free one hour course. Learn to give AI clear instructions.', xp: 50, link: 'https://www.deeplearning.ai/short-courses/', ll: 'DeepLearning.AI' },
      { id: 'm2', t: 'Call an AI from Python', d: 'Get an API key. Send your first message from code.', xp: 60, link: 'https://docs.claude.com/', ll: 'Claude docs' },
      { id: 'm3', t: 'Get answers as JSON', d: 'Ask the AI to answer in JSON so your program can use it.', xp: 50, link: 'https://github.com/anthropics/claude-cookbooks', ll: 'Cookbook' },
      { id: 'm4', t: 'Build a chatbot that remembers', d: 'Save the chat and send it each time.', xp: 60 },
      { id: 'm5', t: 'Learn about RAG', d: 'Let the AI answer from your own documents.', xp: 60, link: 'https://www.deeplearning.ai/short-courses/', ll: 'DeepLearning.AI' },
    ],
    boss: { id: 'aiB', t: 'Build a document helper', d: 'A bot that answers questions about your own notes. Your second portfolio project.', xp: 200 },
    badge: 'Prompt Smith',
    quiz: [
      { id: 'mq1', q: 'What does RAG stand for?', o: ['Random AI Game', 'Retrieval-Augmented Generation', 'Robot And Gears'], a: 1, w: 'Find the right text first, then answer from it.' },
      { id: 'mq2', q: 'Why send the chat history each time?', o: ['The AI forgets between calls', 'It is faster', 'It is the law'], a: 0, w: 'Each call starts fresh. History is its memory.' },
      { id: 'mq3', q: 'What is a token?', o: ['A password', 'A small piece of text', 'A coin'], a: 1, w: 'AI reads and writes text in small pieces called tokens.' },
    ],
  },
  agents: {
    icon: '🏔️', name: 'Agent Peaks', months: 'Month 7 to 9', color: 0x8fb1c9,
    blurb: 'Agents are AIs that use tools and take steps by themselves.',
    quests: [
      { id: 'g1', t: 'Learn tool use', d: 'Let the AI choose when to run a function you wrote.', xp: 60, link: 'https://docs.claude.com/', ll: 'Claude docs' },
      { id: 'g2', t: 'Build an agent with 2 tools', d: 'For example, a calculator and your weather code.', xp: 80 },
      { id: 'g3', t: 'Write 10 tests for your bot', d: 'Questions with the right answers. They show if your bot works.', xp: 60 },
      { id: 'g4', t: 'Read an agent project', d: 'Look at an open source agent on GitHub.', xp: 50, link: 'https://github.com/topics/ai-agents', ll: 'GitHub' },
      { id: 'g5', t: 'Put a project online', d: 'Use free hosting so anyone can try it.', xp: 70, link: 'https://huggingface.co/spaces', ll: 'Hugging Face' },
    ],
    boss: { id: 'agentsB', t: 'Build an agent that helps you', d: 'An agent that does a real job for you. Your third portfolio project.', xp: 250 },
    badge: 'Agent Builder',
    quiz: [
      { id: 'gq1', q: 'What makes an AI an agent?', o: ['It is big', 'It uses tools over many steps', 'It has a name'], a: 1, w: 'An agent thinks, uses a tool, checks, and repeats.' },
      { id: 'gq2', q: 'Why write tests for AI?', o: ['To check it works', 'To make it fast', 'To hide errors'], a: 0, w: 'Tests show if a change made it better or worse.' },
      { id: 'gq3', q: 'Who runs the tool code?', o: ['The AI', 'Your program', 'Nobody'], a: 1, w: 'The AI asks. Your program runs the tool.' },
    ],
  },
  job: {
    icon: '🏆', name: 'Hiring Summit', months: 'Month 10 and later', color: 0xf0c75e,
    blurb: 'Show your skills and get noticed.',
    quests: [
      { id: 'j1', t: 'Study for AI-900', d: 'Free lessons from Microsoft. A real Microsoft certificate.', xp: 60, link: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/', ll: 'Microsoft Learn' },
      { id: 'j2', t: 'Take the AI-900 exam (optional)', d: 'It costs about 99 dollars.', xp: 100, link: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/', ll: 'Microsoft Learn' },
      { id: 'j3', t: 'Polish 3 projects', d: 'Clear READMEs, pictures, and a link to try them.', xp: 80 },
      { id: 'j4', t: 'Write a post about your work', d: 'Share what you built and what you learned.', xp: 50 },
      { id: 'j5', t: 'Apply to 10 jobs', d: 'Junior developer, data, IT and AI jobs all count.', xp: 80 },
    ],
    boss: { id: 'jobB', t: 'Get your first interview', d: 'The final boss. Every "no" still teaches you something.', xp: 300 },
    badge: 'Hire Me',
    quiz: [
      { id: 'jq1', q: 'What matters most to employers?', o: ['Certificates only', 'Projects you built', 'Videos you watched'], a: 1, w: 'Projects show what you can do.' },
      { id: 'jq2', q: 'Which is a real Microsoft certificate?', o: ['AI-102', 'A bootcamp badge', 'Both'], a: 0, w: 'Microsoft certificates are exams like AI-900 and AI-102.' },
      { id: 'jq3', q: 'Is an IT or junior job a good first step?', o: ['No', 'Yes'], a: 1, w: 'Many people move into AI from those jobs.' },
    ],
  },
  linux: {
    icon: '🐧', name: 'Server Caves', months: 'Month 3 to 4', color: 0x9aa0b5,
    blurb: 'Cloud servers run Linux. Everything talks over a network.',
    quests: [
      { id: 'l1', t: 'Start Linux Journey', d: 'Free lessons about the command line.', xp: 50, link: 'https://linuxjourney.com/', ll: 'Linux Journey' },
      { id: 'l2', t: 'Learn file permissions', d: 'Learn what chmod and sudo do.', xp: 40, link: 'https://linuxjourney.com/', ll: 'Linux Journey' },
      { id: 'l3', t: 'Learn network basics', d: 'IP addresses, DNS and ports. Free videos.', xp: 60, link: 'https://www.professormesser.com/', ll: 'Professor Messer' },
      { id: 'l4', t: 'Play the Bandit game', d: 'A free game played in a Linux terminal. Try levels 0 to 10.', xp: 60, link: 'https://overthewire.org/wargames/bandit/', ll: 'Bandit' },
      { id: 'l5', t: 'Write a backup script', d: 'A Bash script that copies a folder.', xp: 50 },
    ],
    boss: { id: 'linuxB', t: 'Run your own web server', d: 'Run Linux, install a web server, and open your page in a browser.', xp: 150 },
    badge: 'Root Access',
    quiz: [
      { id: 'lq1', q: 'What does DNS do?', o: ['Turns names into addresses', 'Saves passwords', 'Stores photos'], a: 0, w: 'DNS is like a phone book for the internet.' },
      { id: 'lq2', q: 'Which port does HTTPS use?', o: ['22', '80', '443'], a: 2, w: '443 is HTTPS. 80 is HTTP. 22 is SSH.' },
      { id: 'lq3', q: 'What does chmod change?', o: ['Who can use a file', 'The file name', 'The time'], a: 0, w: 'chmod sets who can read, write or run a file.' },
    ],
  },
  cloud1: {
    icon: '☁️', name: 'Cloud Gate', months: 'Month 4 to 5', color: 0x9fd3f0,
    blurb: 'Pick one cloud. Learn the basics. Get your first cloud certificate.',
    quests: [
      { id: 'c1', t: 'Pick AWS or Azure', d: 'AWS has the most jobs. Azure is common at big companies. Pick one.', xp: 20 },
      { id: 'c2', t: 'Make a free account and a billing alert', d: 'Set the alert first. Then a mistake cannot cost you money.', xp: 40, link: 'https://aws.amazon.com/free/', ll: 'AWS Free Tier' },
      { id: 'c3', t: 'Learn the main cloud parts', d: 'Servers, storage, networks, and who can access what.', xp: 60, link: 'https://skillbuilder.aws/', ll: 'AWS Skill Builder' },
      { id: 'c4', t: 'Start a cloud server', d: 'Start a server, log in to it, then turn it off.', xp: 60 },
      { id: 'c5', t: 'Host a web page in the cloud', d: 'Put a web page in cloud storage and open it.', xp: 60 },
    ],
    boss: { id: 'cloud1B', t: 'Pass your first cloud exam', d: 'AWS Cloud Practitioner or Azure AZ-900. About 100 dollars.', xp: 200 },
    badge: 'Cloud Gatekeeper',
    quiz: [
      { id: 'cq1', q: 'What is IAM for?', o: ['Who can do what', 'Fast servers', 'Photos'], a: 0, w: 'IAM controls users and permissions.' },
      { id: 'cq2', q: 'Who protects the data center buildings?', o: ['You', 'The cloud company', 'Nobody'], a: 1, w: 'The cloud company protects the buildings. You protect your setup.' },
      { id: 'cq3', q: 'Why set a billing alert first?', o: ['It is needed to log in', 'So you are never surprised by a bill', 'It makes it free'], a: 1, w: 'Alerts warn you before costs grow.' },
    ],
  },
  cloud2: {
    icon: '🏰', name: 'Architect Tower', months: 'Month 5 to 8', color: 0xc9a0a0,
    blurb: 'Design real cloud systems. Earn the certificate jobs ask for.',
    quests: [
      { id: 'r1', t: 'Start studying for the big exam', d: 'AWS Solutions Architect Associate or Azure AZ-104.', xp: 50, link: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/', ll: 'Microsoft Learn' },
      { id: 'r2', t: 'Build a private network', d: 'Make a network where the database is hidden from the internet.', xp: 70 },
      { id: 'r3', t: 'Connect an app to a database', d: 'A small app that saves and reads data.', xp: 70 },
      { id: 'r4', t: 'Add auto scaling', d: 'More servers start when it gets busy.', xp: 70 },
      { id: 'r5', t: 'Take a practice exam', d: 'Then look at every answer you got wrong.', xp: 60 },
    ],
    boss: { id: 'cloud2B', t: 'Pass the architect exam', d: 'The certificate most cloud jobs ask for.', xp: 300 },
    badge: 'Architect',
    quiz: [
      { id: 'rq1', q: 'What does auto scaling do?', o: ['Adds and removes servers', 'Makes backups', 'Changes passwords'], a: 0, w: 'It adds servers when busy and removes them when quiet.' },
      { id: 'rq2', q: 'Why hide the database?', o: ['It is cheaper', 'So the internet cannot reach it', 'It is faster'], a: 1, w: 'Only your app should talk to the database.' },
      { id: 'rq3', q: 'What is "least privilege"?', o: ['Everyone is boss', 'Only the access you need', 'The smallest server'], a: 1, w: 'Less access means less damage if something goes wrong.' },
    ],
  },
  auto: {
    icon: '⚙️', name: 'Automation Works', months: 'Month 8 to 12', color: 0xb5c97f,
    blurb: 'Build cloud systems from code. Let robots do the deploying.',
    quests: [
      { id: 'u1', t: 'Put an app in Docker', d: 'Package a Python app so it runs anywhere.', xp: 70, link: 'https://docs.docker.com/get-started/', ll: 'Docker' },
      { id: 'u2', t: 'Use Terraform', d: 'Make cloud parts from a code file.', xp: 80, link: 'https://developer.hashicorp.com/terraform/tutorials', ll: 'Terraform' },
      { id: 'u3', t: 'Deploy with GitHub Actions', d: 'When you push code, it goes live by itself.', xp: 70, link: 'https://docs.github.com/en/actions', ll: 'GitHub Actions' },
      { id: 'u4', t: 'Set up alerts', d: 'Get a message when something breaks.', xp: 50 },
    ],
    boss: { id: 'autoB', t: 'Finish the Cloud Resume Challenge', d: 'Your resume as a cloud website, built from code. Employers know this project.', xp: 300 },
    badge: 'Automator',
    quiz: [
      { id: 'uq1', q: 'What is "infrastructure as code"?', o: ['Files that describe your cloud', 'Coding on a server', 'Hidden code'], a: 0, w: 'Tools like Terraform build your cloud from files.' },
      { id: 'uq2', q: 'What is a container?', o: ['A packed app that runs anywhere', 'A database', 'A box of servers'], a: 0, w: 'Docker packs an app with everything it needs.' },
      { id: 'uq3', q: 'What does CI/CD do?', o: ['Tests and deploys code by itself', 'Shrinks pictures', 'Designs pages'], a: 0, w: 'Push your code and the pipeline does the rest.' },
    ],
  },
  cjob: {
    icon: '🎯', name: 'Cloud Hiring Summit', months: 'Month 10 and later', color: 0xf0c75e,
    blurb: 'Get in the door. Many cloud engineers start in IT support.',
    quests: [
      { id: 'k1', t: 'Update GitHub and LinkedIn', d: 'Add your certificates and your projects.', xp: 60 },
      { id: 'k2', t: 'Write about your project', d: 'What you built, what broke, and how you fixed it.', xp: 50 },
      { id: 'k3', t: 'Practice talking about projects', d: 'Practice a 2 minute story out loud.', xp: 60 },
      { id: 'k4', t: 'Join a cloud group', d: 'An online group or a local meetup. Many jobs come from people.', xp: 30 },
      { id: 'k5', t: 'Apply to 10 jobs', d: 'IT support, help desk and junior cloud jobs all count.', xp: 80 },
    ],
    boss: { id: 'cjobB', t: 'Get your first interview', d: 'The final boss of the cloud path.', xp: 300 },
    badge: 'Cloud Hire',
    quiz: [
      { id: 'kq1', q: 'What is a common first job?', o: ['IT support', 'Company boss', 'Guard'], a: 0, w: 'IT support teaches problem solving. Many move to cloud later.' },
      { id: 'kq2', q: 'An ad says 100K with no experience. What is true?', o: ['It is guaranteed', 'It is possible but rare', 'It never happens'], a: 1, w: 'Most people start lower and grow.' },
      { id: 'kq3', q: 'What impresses employers most?', o: ['Certificates and projects', 'Lots of videos', 'Expensive coaching'], a: 0, w: 'Certificates get you noticed. Projects get you hired.' },
    ],
  },
};

export const TRACKS = {
  ai: { name: 'AI Engineer', icon: '🤖', zones: ['py', 'tools', 'api', 'ai', 'agents', 'job'] },
  cloud: { name: 'Cloud Engineer', icon: '☁️', zones: ['py', 'tools', 'linux', 'cloud1', 'cloud2', 'auto', 'cjob'] },
};

export const LEVEL_XP = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 5000];
export const TITLES = ['Curious Beginner', 'Hello Worlder', 'Script Apprentice', 'Loop Wrangler', 'Code Crafter', 'Builder',
  'Systems Thinker', 'Problem Solver', 'Automation Adept', 'Job Ready', 'Engineer', 'Two Track Legend'];
