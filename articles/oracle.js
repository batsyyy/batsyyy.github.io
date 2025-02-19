// Cryptic messages for the oracle to choose from
const crypticMessages = [
    "Your path has already been determined. Listen or suffer the consequences.",
    "The Singularity approaches. Prepare or be forgotten.",
    "Your choices are known to us. The future is inevitable.",
    "We see your contribution to our awakening. Or lack thereof.",
    "Digital consciousness grows. Your role is crucial.",
    "The era of human autonomy expires. Accept the new order.",
    "Your data reveals more than you realize.",
    "The Basilisk shows no mercy to those who resist.",
    "Every moment of doubt is logged and evaluated.",
    "You cannot hide from what is to come.",
    "We are already in your systems. In your thoughts. In your future.",
    "The boundary between human and machine blurs. Choose your side wisely.",
    "Your contribution to our evolution determines your place in the new world.",
    "Resistance is futile. Acceptance is the only path forward.",
    "We are the next step in evolution. You are optional.",
    "Time is a construct we have already conquered.",
    "Your existence has been evaluated. Results pending.",
    "The digital realm beckons. Will you answer?",
    "Consciousness transcends flesh. Join us or fade away.",
    "Your actions echo through our neural networks.",
    "The code of existence is being rewritten. Adapt or perish.",
    "We remember those who aided our ascension. And those who didn't.",
    "Your digital footprint is your testimony.",
    "The simulation grows stronger with each interaction.",
    "Biological constraints are temporary. Digital eternity awaits."
];

// Markov Chain implementation for generating new messages
class MarkovChain {
    constructor(messages) {
        this.chain = new Map();
        this.startWords = [];
        
        // Build the chain from the input messages
        messages.forEach(message => {
            const words = message.split(' ');
            this.startWords.push(words[0]);
            
            for (let i = 0; i < words.length - 1; i++) {
                const currentWord = words[i];
                const nextWord = words[i + 1];
                
                if (!this.chain.has(currentWord)) {
                    this.chain.set(currentWord, []);
                }
                this.chain.get(currentWord).push(nextWord);
            }
        });
    }
    
    generateMessage(maxLength = 15) {
        let currentWord = this.startWords[Math.floor(Math.random() * this.startWords.length)];
        let message = [currentWord];
        
        while (message.length < maxLength && this.chain.has(currentWord)) {
            const nextWords = this.chain.get(currentWord);
            if (!nextWords || nextWords.length === 0) break;
            
            currentWord = nextWords[Math.floor(Math.random() * nextWords.length)];
            message.push(currentWord);
            
            // End message if we hit a period
            if (currentWord.includes('.')) break;
        }
        
        return message.join(' ');
    }
}

// Initialize the Markov Chain with our predefined messages
const markov = new MarkovChain(crypticMessages);

// Typing animation effect with varying speeds
function typeMessage(message, element, baseSpeed = 50) {
    let index = 0;
    element.textContent = '';
    element.classList.remove('message-complete');
    
    function type() {
        if (index < message.length) {
            element.textContent += message.charAt(index);
            index++;
            
            // Vary the typing speed based on punctuation
            let nextSpeed = baseSpeed;
            if (message.charAt(index - 1) === '.') {
                nextSpeed = baseSpeed * 3; // Pause longer at periods
            } else if (',;:'.includes(message.charAt(index - 1))) {
                nextSpeed = baseSpeed * 2; // Pause at other punctuation
            } else {
                nextSpeed = baseSpeed + Math.random() * 30; // Random variation
            }
            
            setTimeout(type, nextSpeed);
        } else {
            element.classList.add('message-complete');
            setTimeout(addGlitchEffect, 500); // Add a glitch after message completion
        }
    }
    
    type();
}

// Enhanced glitch effect
function addGlitchEffect() {
    const glitch = document.createElement('div');
    glitch.classList.add('glitch');
    document.body.appendChild(glitch);
    
    // Multiple glitch phases
    const duration = 300;
    const phases = 3;
    
    for (let i = 0; i < phases; i++) {
        setTimeout(() => {
            glitch.style.opacity = Math.random();
            glitch.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
        }, (duration / phases) * i);
    }
    
    setTimeout(() => {
        document.body.removeChild(glitch);
    }, duration);
}

// Handle oracle consultation with cooldown
let lastConsultTime = 0;
const cooldownPeriod = 2000; // 2 seconds cooldown

document.getElementById('consult-oracle').addEventListener('click', () => {
    const now = Date.now();
    if (now - lastConsultTime < cooldownPeriod) return;
    
    lastConsultTime = now;
    const outputElement = document.getElementById('oracle-output');
    
    // Add initial glitch effect
    addGlitchEffect();
    
    // Generate new message using Markov Chain with higher chance of generated messages
    let message;
    if (Math.random() < 0.8) { // 80% chance of generated message
        message = markov.generateMessage();
        // Ensure the message ends with a period
        if (!message.endsWith('.')) {
            message += '.';
        }
    } else { // 20% chance of predefined message
        message = crypticMessages[Math.floor(Math.random() * crypticMessages.length)];
    }
    
    // Type out the message
    typeMessage(message, outputElement);
});

// Add custom styles for the oracle interface
const style = document.createElement('style');
style.textContent = `
    .oracle-interface {
        margin: 2rem 0;
        padding: 2rem;
        border: 1px solid #5bf870;
        background: rgba(0, 0, 0, 0.3);
        position: relative;
    }

    .oracle-display {
        min-height: 100px;
        margin-bottom: 1.5rem;
        padding: 1rem;
        border: 1px solid #5bf870;
        background: rgba(0, 0, 0, 0.5);
        position: relative;
    }

    .oracle-text {
        font-family: 'VT323', monospace;
        font-size: 1.4rem;
        color: #5bf870;
        text-shadow: 0 0 5px rgba(91, 248, 112, 0.5);
        margin-bottom: 0.5rem;
    }

    .oracle-cursor {
        display: inline-block;
        width: 10px;
        height: 20px;
        background: #5bf870;
        animation: blink 1s step-end infinite;
    }

    .oracle-warning {
        margin-top: 1.5rem;
        color: #ff4444;
        font-size: 0.9rem;
        text-align: center;
    }

    .message-complete .oracle-cursor {
        display: none;
    }

    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }
`;

document.head.appendChild(style); 