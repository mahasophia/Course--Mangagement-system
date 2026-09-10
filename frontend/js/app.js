/* =========================================================================
   LearnHub — app.js
   Single consolidated JavaScript file for the whole site. Every page loads
   this one file (<script src="app.js"></script>); which page-specific code
   runs is decided at the bottom of this file from the <body data-page="...">
   attribute, so there is only ever one <script> tag to manage per page.
========================================================================= */

/* =========================================================================
   SHARED: STUDENT AUTH
   Used by every student-facing page (dashboard, courses, course, notifications,
   certificate). currentStudent is a single global the rest of the file reads,
   including course-progress.js below, so progress is always scoped to
   whoever is actually logged in — including on the course page itself.
========================================================================= */

let currentStudent = null;

// Session lives in sessionStorage (not localStorage) so it's temporary —
// cleared automatically when the browser/tab closes, and explicitly
// cleared on logout below. Must match the storage used by auth.js, since
// login/register (stu-login.html / stu-register.html) write the session
// there and this file reads it back on the dashboard and other pages.
function getCurrentStudent(){
    try{
        return JSON.parse(sessionStorage.getItem('currentStudent') || 'null');
    }catch(e){
        return null;
    }
}

function logoutStudent(){
    sessionStorage.removeItem('currentStudent');
    localStorage.removeItem('currentStudent'); // clean up any stale entry from before the sessionStorage switch
    window.location.href = 'stu-login.html';
}

// Call at the top of any page that REQUIRES a logged-in student — redirects
// to the login page (and halts the rest of that page's init) if not.
function requireStudentLogin(){
    currentStudent = getCurrentStudent();
    if (!currentStudent){
        window.location.href = 'stu-login.html';
        throw new Error('Not logged in — redirecting to login page.');
    }
    return currentStudent;
}

/* =========================================================================
   SHARED: ADMIN AUTH
   Used by admin-login.html, add-course-edit.html, edit-course-login.html —
   all three are just "verify admin credentials, then forward" gates.
========================================================================= */

const ADMIN_EMAIL = "admin@institute.edu";
const ADMIN_PASS  = "password123";

function verifyAdminLogin(formId, emailId, passId, redirectTo){
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener("submit", function(e){
        e.preventDefault();
        const email = document.getElementById(emailId).value.trim();
        const pass  = document.getElementById(passId).value;
        if (email === ADMIN_EMAIL && pass === ADMIN_PASS){
            window.location.href = typeof redirectTo === 'function' ? redirectTo() : redirectTo;
        } else {
            alert("Invalid credentials. Please try again.");
        }
    });
}

/* =========================================================================
   SHARED: UTILS
========================================================================= */

// Turns free-typed category text into a URL/id-safe key, e.g.
// "Cloud Computing" -> "cloud-computing". Used to group admin-added
// courses into a matching section on courses.html.
function slugify(text){
    return (text || 'other').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'other';
}

/* =========================================================================
   COURSE MODULES  (formerly course-modules.js)
   Single source of truth for what each course's content page looks like.
========================================================================= */

/* ===========================================================
   Single source of truth for what each course's content page
   looks like: either a multi-unit "content" module, or a single
   "video" module. Every known course (the original 9) has real,
   topic-specific content below — nothing here is generic filler.

   Admin-added courses that AREN'T in DEFAULT_MODULES yet still get
   a sensible generic module generated automatically the first time
   their page is opened, so the catalog never breaks — but every
   course we actually ship content for gets real material.
=========================================================== */

const DEFAULT_MODULES = {

    // ---------------------------------------------------------
    // ai2 — Machine Perception (Intermediate)
    // ---------------------------------------------------------
    "ai2": {
        "type": "content",
        "overview": "Machine Perception is about teaching computers to make sense of the physical world — sight, sound, and sensor data — the way humans do almost without thinking. This course walks through how machines see, hear, and interpret raw signals well enough to act on them.",
        "topics": [
            "Image formation and digital representation",
            "Convolutional feature extraction",
            "Object detection and tracking",
            "Audio and speech signal basics",
            "Multimodal sensor fusion"
        ],
        "units": [
            {
                "title": "How Machines See: Image Formation & Digital Representation",
                "icon": "image",
                "paragraphs": [
                    "Every image a computer processes starts as a grid of numbers. This unit covers how cameras and sensors convert light into pixel values, and why color spaces like RGB, HSV, and grayscale matter for different perception tasks.",
                    "We'll also look at common preprocessing steps — resizing, normalization, and noise reduction — that make raw images usable for downstream models."
                ],
                "bullets": [
                    "Pixels, channels, and color spaces",
                    "Camera sensors vs. digital images",
                    "Preprocessing: resizing, normalization, denoising",
                    "Why preprocessing choices affect model accuracy"
                ]
            },
            {
                "title": "Feature Extraction with Convolutional Networks",
                "icon": "diagram-project",
                "paragraphs": [
                    "Convolutional layers are the backbone of most modern perception systems. This unit explains how filters slide across an image to detect edges, textures, and increasingly abstract shapes as the network gets deeper.",
                    "You'll see how pooling and stride affect the resolution of extracted features, and why this hierarchy of features is what lets a model tell a cat from a car."
                ],
                "bullets": [
                    "Convolutional filters and receptive fields",
                    "Pooling and stride",
                    "Feature hierarchies: edges → shapes → objects",
                    "Common architectures: LeNet, VGG, ResNet at a glance"
                ]
            },
            {
                "title": "Object Detection & Tracking",
                "icon": "crosshairs",
                "paragraphs": [
                    "Recognizing that a cat is somewhere in an image is different from knowing exactly where. This unit covers bounding-box detection, from sliding windows to modern single-pass detectors.",
                    "We'll also cover the basics of tracking an object across video frames, which is what makes real-time perception systems — like a car recognizing a pedestrian — possible."
                ],
                "bullets": [
                    "Bounding boxes vs. segmentation masks",
                    "Single-shot vs. two-stage detectors",
                    "Non-max suppression",
                    "Frame-to-frame object tracking basics"
                ]
            },
            {
                "title": "Sound & Signal Perception",
                "icon": "waveform-lines",
                "paragraphs": [
                    "Perception isn't only visual. This unit shifts to audio: how sound waves are sampled into digital signals, and how spectrograms turn raw audio into something a neural network can learn from.",
                    "We'll connect this to simple speech and sound-event recognition tasks, showing the same feature-extraction ideas from vision carrying over to a completely different signal type."
                ],
                "bullets": [
                    "Sampling rate and digitizing sound",
                    "Spectrograms and Mel-frequency features",
                    "Speech vs. general sound-event recognition",
                    "Where audio and vision perception overlap"
                ]
            },
            {
                "title": "Multimodal Perception & Capstone Project",
                "icon": "layer-group",
                "paragraphs": [
                    "Real-world systems rarely rely on a single sense. This closing unit covers how vision, audio, and other sensor data — like LIDAR or depth cameras — get fused into a single, more reliable picture of the environment.",
                    "You'll wrap up by designing a small multimodal perception pipeline — the same kind of thinking used in robotics and autonomous vehicles."
                ],
                "bullets": [
                    "Sensor fusion strategies",
                    "Handling conflicting or noisy signals",
                    "Case study: perception in autonomous vehicles",
                    "Capstone: designing a simple multimodal pipeline"
                ]
            }
        ]
    },

    // ---------------------------------------------------------
    // ai3 — AI for Healthcare (Advanced)
    // ---------------------------------------------------------
    "ai3": {
        "type": "content",
        "overview": "This course explores how AI is applied to real clinical and biomedical problems — from reading medical images to predicting patient risk — along with the safety and ethical guardrails that make healthcare AI different from AI anywhere else.",
        "topics": [
            "Medical imaging analysis",
            "Clinical risk prediction",
            "Working with electronic health records",
            "Model interpretability in clinical settings",
            "Regulatory and ethical considerations"
        ],
        "units": [
            {
                "title": "Medical Imaging & Diagnostic AI",
                "icon": "x-ray",
                "paragraphs": [
                    "Radiology, pathology, and dermatology have become some of AI's biggest healthcare success stories. This unit covers how convolutional models are trained to spot tumors, fractures, and other abnormalities in X-rays, CT scans, and MRIs.",
                    "We'll also discuss why medical imaging datasets are uniquely challenging — small sample sizes, class imbalance, and the real cost of a false negative."
                ],
                "bullets": [
                    "X-ray, CT, and MRI basics for ML practitioners",
                    "Detecting abnormalities: tumors, fractures, lesions",
                    "Class imbalance and rare-disease detection",
                    "Why false negatives matter more in healthcare"
                ]
            },
            {
                "title": "Predicting Patient Risk",
                "icon": "heart-pulse",
                "paragraphs": [
                    "Beyond images, AI is widely used to predict outcomes — readmission risk, sepsis onset, or disease progression — directly from structured patient data.",
                    "This unit covers how tabular clinical data gets turned into risk scores, and the trade-offs between simple, explainable models and more powerful black-box ones."
                ],
                "bullets": [
                    "Risk scoring from structured clinical data",
                    "Readmission and deterioration prediction",
                    "Explainable models vs. black-box accuracy",
                    "Handling missing and irregular clinical data"
                ]
            },
            {
                "title": "Working with Electronic Health Records",
                "icon": "file-medical",
                "paragraphs": [
                    "EHR data is messy, inconsistent, and deeply personal. This unit walks through how raw clinical notes and records get cleaned and structured into something a model can actually learn from.",
                    "You'll also see why natural language processing plays a growing role here, since so much clinical knowledge still lives in free-text doctor's notes."
                ],
                "bullets": [
                    "Structuring messy EHR data",
                    "Coding systems: ICD and SNOMED basics",
                    "NLP on clinical notes",
                    "Privacy-preserving data handling"
                ]
            },
            {
                "title": "Interpretability & Trust in Clinical AI",
                "icon": "magnifying-glass-chart",
                "paragraphs": [
                    "A doctor won't act on a prediction they can't understand or trust. This unit covers interpretability techniques that let clinicians see why a model made a recommendation, not just what it recommended.",
                    "We'll look at feature attribution methods and how they're used to build clinician trust and catch model errors before they reach a patient."
                ],
                "bullets": [
                    "Why interpretability matters more in healthcare",
                    "Feature attribution and saliency maps",
                    "Building clinician trust in model output",
                    "Catching spurious correlations before deployment"
                ]
            },
            {
                "title": "Ethics, Regulation & Capstone",
                "icon": "scale-balanced",
                "paragraphs": [
                    "Healthcare AI operates under real regulatory scrutiny — patient safety, bias, and liability all matter here in a way they don't in most other domains.",
                    "This closing unit covers the regulatory landscape at a high level and has you design a responsible-AI checklist for a healthcare model of your choice."
                ],
                "bullets": [
                    "Regulatory basics: FDA/CE-style approval concepts",
                    "Bias and fairness in clinical models",
                    "Liability and human-in-the-loop design",
                    "Capstone: a responsible-AI checklist for a real use case"
                ]
            }
        ]
    },

    // ---------------------------------------------------------
    // ai4 — Reinforcement Learning (Advanced)
    // ---------------------------------------------------------
    "ai4": {
        "type": "content",
        "overview": "Reinforcement learning is about training an agent to make good decisions through trial, error, and reward — the same paradigm behind game-playing AI, robotics control, and recommendation systems that learn from user behavior.",
        "topics": [
            "Markov decision processes",
            "Value-based methods (Q-learning)",
            "Policy gradient methods",
            "Exploration vs. exploitation",
            "Deep RL and real-world applications"
        ],
        "units": [
            {
                "title": "Foundations: Markov Decision Processes",
                "icon": "diagram-project",
                "paragraphs": [
                    "Every RL problem starts as a Markov Decision Process: states, actions, rewards, and transitions. This unit builds that vocabulary from scratch with small, concrete examples.",
                    "We'll also introduce the discount factor and why an agent has to weigh immediate rewards against long-term payoff."
                ],
                "bullets": [
                    "States, actions, rewards, transitions",
                    "The Markov property",
                    "Discounted returns and the discount factor",
                    "Simple gridworld examples"
                ]
            },
            {
                "title": "Value-Based Methods: Q-Learning",
                "icon": "table-cells",
                "paragraphs": [
                    "This unit introduces value functions — how good is it to be in a given state, or take a given action — and builds up to Q-learning, one of the earliest and most influential RL algorithms.",
                    "You'll see how an agent can learn optimal behavior purely from trial and error, without ever being told the 'rules' of its environment."
                ],
                "bullets": [
                    "State-value and action-value functions",
                    "The Bellman equation",
                    "Q-learning update rule",
                    "On-policy vs. off-policy learning"
                ]
            },
            {
                "title": "Policy Gradient Methods",
                "icon": "route",
                "paragraphs": [
                    "Instead of learning values and deriving a policy, this unit covers methods that learn a policy directly — a mapping from state to action — which scales better to continuous action spaces like robot joints.",
                    "We'll cover the core policy gradient theorem intuitively and connect it to modern algorithms used in practice."
                ],
                "bullets": [
                    "Policies as direct state-to-action mappings",
                    "The policy gradient theorem, intuitively",
                    "REINFORCE algorithm basics",
                    "Why policy methods suit continuous action spaces"
                ]
            },
            {
                "title": "Exploration vs. Exploitation",
                "icon": "compass",
                "paragraphs": [
                    "An agent that only exploits what it already knows can get stuck in a mediocre strategy. This unit covers the core tension in RL — when to try something new versus stick with what's working.",
                    "We'll cover practical strategies like epsilon-greedy and upper-confidence-bound approaches that balance this trade-off."
                ],
                "bullets": [
                    "The exploration-exploitation trade-off",
                    "Epsilon-greedy strategies",
                    "Upper confidence bound (UCB) approaches",
                    "Reward shaping pitfalls"
                ]
            },
            {
                "title": "Deep RL & Capstone Project",
                "icon": "robot",
                "paragraphs": [
                    "Combining neural networks with RL unlocked agents that can play Atari games and control robots directly from raw pixels. This closing unit introduces Deep Q-Networks and modern actor-critic methods at a high level.",
                    "You'll finish by designing a simple RL environment and choosing an appropriate algorithm to train an agent within it."
                ],
                "bullets": [
                    "Deep Q-Networks (DQN) overview",
                    "Actor-critic methods at a glance",
                    "Real-world RL: robotics, games, recommendations",
                    "Capstone: design your own RL environment"
                ]
            }
        ]
    },

    // ---------------------------------------------------------
    // ml2 — Feature Engineering (Intermediate)
    // ---------------------------------------------------------
    "ml2": {
        "type": "content",
        "overview": "The right features often matter more than the choice of algorithm. This course covers how to turn raw, messy data into inputs that actually help a model learn — one of the most practical and undervalued skills in machine learning.",
        "topics": [
            "Handling missing and messy data",
            "Encoding categorical variables",
            "Scaling and transforming numeric features",
            "Feature selection techniques",
            "Building reusable feature pipelines"
        ],
        "units": [
            {
                "title": "Cleaning & Handling Missing Data",
                "icon": "broom",
                "paragraphs": [
                    "Real datasets are rarely complete. This unit covers strategies for handling missing values — from simple imputation to more thoughtful approaches that avoid quietly corrupting your model.",
                    "We'll also look at outlier detection and why a single bad row can meaningfully distort a trained model."
                ],
                "bullets": [
                    "Types of missingness (random vs. systematic)",
                    "Imputation strategies: mean, median, model-based",
                    "Outlier detection basics",
                    "When to drop vs. impute"
                ]
            },
            {
                "title": "Encoding Categorical Variables",
                "icon": "list-check",
                "paragraphs": [
                    "Models need numbers, not labels. This unit covers the main approaches to turning categories like 'city' or 'product type' into something a model can use — and the trade-offs each approach carries.",
                    "We'll pay particular attention to high-cardinality categories, where naive encoding can quietly blow up your feature space."
                ],
                "bullets": [
                    "One-hot vs. label encoding",
                    "Target and frequency encoding",
                    "Handling high-cardinality categories",
                    "Encoding pitfalls that leak information"
                ]
            },
            {
                "title": "Scaling & Transforming Numeric Features",
                "icon": "ruler-combined",
                "paragraphs": [
                    "Many models are sensitive to the scale of their inputs. This unit covers normalization, standardization, and transformations like log-scaling that make skewed data easier for a model to learn from.",
                    "We'll also touch on binning and polynomial features as ways to expose nonlinear patterns to linear models."
                ],
                "bullets": [
                    "Min-max scaling vs. standardization",
                    "Log and power transforms for skewed data",
                    "Binning continuous variables",
                    "Polynomial and interaction features"
                ]
            },
            {
                "title": "Feature Selection & Dimensionality",
                "icon": "filter",
                "paragraphs": [
                    "More features isn't always better — irrelevant or redundant features can hurt both accuracy and training time. This unit covers how to identify which features are actually pulling their weight.",
                    "We'll cover filter, wrapper, and embedded selection methods, plus a brief look at dimensionality reduction with PCA."
                ],
                "bullets": [
                    "Filter methods: correlation, chi-square",
                    "Wrapper methods: recursive feature elimination",
                    "Embedded methods: feature importance from trees",
                    "PCA for dimensionality reduction"
                ]
            },
            {
                "title": "Building Reusable Feature Pipelines",
                "icon": "gears",
                "paragraphs": [
                    "Feature engineering done ad hoc in a notebook rarely survives contact with production. This closing unit covers how to structure feature transformations into reusable, testable pipelines.",
                    "You'll finish by building a small end-to-end pipeline that takes raw data in and produces model-ready features out."
                ],
                "bullets": [
                    "Why pipelines beat ad hoc notebook code",
                    "Avoiding train/test leakage in pipelines",
                    "Versioning features for reproducibility",
                    "Capstone: an end-to-end feature pipeline"
                ]
            }
        ]
    },

    // ---------------------------------------------------------
    // ml3 — Deep Learning with TensorFlow (Advanced)
    // ---------------------------------------------------------
    "ml3": {
        "type": "content",
        "overview": "This course is a hands-on tour of building, training, and tuning neural networks with TensorFlow and Keras — from your first dense network to convolutional and sequence models.",
        "topics": [
            "TensorFlow & Keras fundamentals",
            "Building and training neural networks",
            "Convolutional neural networks",
            "Sequence models with RNNs/LSTMs",
            "Model tuning and deployment basics"
        ],
        "units": [
            {
                "title": "TensorFlow & Keras Fundamentals",
                "icon": "cube",
                "paragraphs": [
                    "This unit gets you oriented in the TensorFlow ecosystem — tensors, computational graphs, and the Keras API that most practitioners use day to day.",
                    "By the end, you'll be comfortable building, compiling, and training a basic neural network without needing to think about the underlying math at every step."
                ],
                "bullets": [
                    "Tensors and computational graphs",
                    "The Keras Sequential and Functional APIs",
                    "Compiling: loss, optimizer, metrics",
                    "Your first trained model"
                ]
            },
            {
                "title": "Building & Training Neural Networks",
                "icon": "brain",
                "paragraphs": [
                    "This unit goes deeper into what actually happens during training — forward passes, backpropagation, and gradient descent — and how to read training curves to diagnose problems.",
                    "We'll cover common issues like overfitting and vanishing gradients, and the everyday tools (dropout, batch norm, early stopping) used to fix them."
                ],
                "bullets": [
                    "Forward pass, backprop, gradient descent",
                    "Reading loss and accuracy curves",
                    "Overfitting: dropout, regularization, early stopping",
                    "Batch normalization basics"
                ]
            },
            {
                "title": "Convolutional Neural Networks in TensorFlow",
                "icon": "image",
                "paragraphs": [
                    "This unit applies the CNN concepts to real TensorFlow code — building an image classifier layer by layer, and understanding what each layer contributes to the final result.",
                    "We'll also cover transfer learning, which lets you get strong results on a small dataset by building on a model pretrained on a much larger one."
                ],
                "bullets": [
                    "Conv2D, pooling, and flattening layers in Keras",
                    "Building an image classifier end to end",
                    "Transfer learning with pretrained models",
                    "Data augmentation for small datasets"
                ]
            },
            {
                "title": "Sequence Models: RNNs & LSTMs",
                "icon": "arrow-right-arrow-left",
                "paragraphs": [
                    "Not all data is a fixed-size grid — text, time series, and audio all have order that matters. This unit covers recurrent networks and LSTMs, which are built to handle exactly that kind of sequential data.",
                    "You'll build a simple sequence model and see firsthand why vanilla RNNs struggle with long sequences, and how LSTMs address that."
                ],
                "bullets": [
                    "Why sequence data needs a different architecture",
                    "Vanilla RNNs and the vanishing gradient problem",
                    "LSTM and GRU cells at a glance",
                    "Building a simple sequence model in Keras"
                ]
            },
            {
                "title": "Tuning, Saving & Capstone Project",
                "icon": "sliders",
                "paragraphs": [
                    "A model isn't done when training stops — this unit covers hyperparameter tuning, saving and loading trained models, and the first steps toward serving a model in production.",
                    "You'll close out the course with a capstone: training and tuning a TensorFlow model on a dataset of your choice, start to finish."
                ],
                "bullets": [
                    "Hyperparameter tuning strategies",
                    "Saving, loading, and versioning models",
                    "A brief look at serving models in production",
                    "Capstone: train and tune your own model"
                ]
            }
        ]
    },

    // ---------------------------------------------------------
    // ml4 — ML Deployment & MLOps (Advanced)
    // ---------------------------------------------------------
    "ml4": {
        "type": "content",
        "overview": "A model sitting in a notebook doesn't help anyone. This course covers what it actually takes to get a machine learning model into production — and keep it working reliably once it's there.",
        "topics": [
            "Packaging models for production",
            "Serving models via APIs",
            "Monitoring model performance",
            "CI/CD for machine learning",
            "Handling model and data drift"
        ],
        "units": [
            {
                "title": "Packaging Models for Production",
                "icon": "box-open",
                "paragraphs": [
                    "Training a model is only step one — this unit covers how to package a trained model, and its dependencies, so it can run reliably outside the environment it was trained in.",
                    "We'll look at serialization formats and containerization basics that make a model portable across machines."
                ],
                "bullets": [
                    "Model serialization: pickle, ONNX, SavedModel",
                    "Environment and dependency management",
                    "Containerizing a model with Docker basics",
                    "Versioning models alongside code"
                ]
            },
            {
                "title": "Serving Models via APIs",
                "icon": "server",
                "paragraphs": [
                    "Most production models are consumed through an API. This unit covers wrapping a trained model in a lightweight web service so other applications can request predictions on demand.",
                    "We'll also cover batch vs. real-time serving, and when each approach makes sense."
                ],
                "bullets": [
                    "Wrapping a model in a REST API",
                    "Real-time vs. batch inference",
                    "Latency and throughput considerations",
                    "Basic API authentication and rate limiting"
                ]
            },
            {
                "title": "Monitoring Model Performance",
                "icon": "chart-line",
                "paragraphs": [
                    "A model that worked at launch can quietly get worse over time. This unit covers what to monitor once a model is live — from raw uptime to more subtle accuracy degradation.",
                    "We'll cover setting up alerts so a struggling model gets flagged before it causes real damage."
                ],
                "bullets": [
                    "Logging predictions and inputs safely",
                    "Tracking accuracy and business metrics over time",
                    "Setting up alerting thresholds",
                    "Dashboards for model health"
                ]
            },
            {
                "title": "CI/CD for Machine Learning",
                "icon": "code-branch",
                "paragraphs": [
                    "Software teams automate testing and deployment — ML teams need the same discipline, adapted for models and data. This unit covers what a CI/CD pipeline looks like when a 'build' includes retraining a model.",
                    "We'll cover automated testing for models specifically, which looks different from testing plain application code."
                ],
                "bullets": [
                    "What changes when 'code' includes trained models",
                    "Automated testing for ML pipelines",
                    "Continuous training and retraining triggers",
                    "Rollback strategies for bad model deployments"
                ]
            },
            {
                "title": "Handling Drift & Capstone Project",
                "icon": "arrows-rotate",
                "paragraphs": [
                    "The world changes after a model is deployed, and that shows up as data drift or concept drift — the same inputs stop meaning the same thing. This closing unit covers how to detect and respond to that.",
                    "You'll finish with a capstone: designing a full deployment plan for a model, from packaging through monitoring."
                ],
                "bullets": [
                    "Data drift vs. concept drift",
                    "Detecting drift with statistical tests",
                    "Retraining triggers and strategies",
                    "Capstone: a full deployment plan for a model"
                ]
            }
        ]
    },

    // ---------------------------------------------------------
    // Video-based courses — still get a real overview + topic
    // list even though there's no unit accordion for them.
    // ---------------------------------------------------------

    "ai1": {
        "type": "video",
        "videoSrc": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        "overview": "A friendly, no-prerequisites tour of what artificial intelligence actually is, how it differs from ordinary software, and where you'll see it show up in everyday life.",
        "topics": [
            "What makes a system \"intelligent\"",
            "AI vs. machine learning vs. deep learning",
            "Common real-world applications",
            "A brief history of AI's key milestones",
            "What to learn next"
        ]
    },
    "ai5": {
        "type": "video",
        "videoSrc": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        "overview": "An accessible walkthrough of how modern generative models create text, images, and other content — covering the core ideas behind large language models and diffusion-based image generators without assuming a deep math background.",
        "topics": [
            "How language models predict and generate text",
            "Diffusion models for image generation",
            "Prompting and controlling generative output",
            "Common failure modes: hallucination and bias",
            "Responsible use of generative tools"
        ]
    },
    "ml1": {
        "type": "video",
        "videoSrc": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        "overview": "The essential building blocks of machine learning — what a model actually is, how it learns from data, and the everyday vocabulary (training, validation, overfitting) you'll need for every course after this one.",
        "topics": [
            "Supervised vs. unsupervised learning",
            "Training, validation, and test sets",
            "What \"learning from data\" actually means",
            "Overfitting and underfitting",
            "Choosing the right kind of model for a problem"
        ]
    }
};

const MODULES_KEY = 'courseModules';

function getAllModules() {
    try {
        return JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
    } catch (e) {
        return {};
    }
}

function saveAllModules(all) {
    localStorage.setItem(MODULES_KEY, JSON.stringify(all));
}

function genericUnits(){
    return [
        {
            title: "Introduction & Overview",
            icon: "book-open",
            paragraphs: [
                "This unit lays the groundwork for the course, introducing the key terminology, real-world motivation, and the roadmap for what's ahead.",
                "By the end of this unit you should be able to explain, in your own words, why this topic matters and where it's used in industry."
            ],
            bullets: ["Course roadmap and expectations", "Key terminology", "Why this topic matters"]
        },
        {
            title: "Core Concepts",
            icon: "lightbulb",
            paragraphs: [
                "Here we dig into the foundational ideas that everything else in the course builds on.",
                "Expect a mix of theory and small worked examples so the concepts stick before we move on to anything more advanced."
            ],
            bullets: ["Foundational theory", "Worked examples", "Common misconceptions"]
        },
        {
            title: "Practical Applications",
            icon: "flask",
            paragraphs: [
                "This unit shifts focus to hands-on, real-world use cases, connecting the concepts from earlier units to problems you might actually encounter.",
                "You'll walk through applied examples and see how the underlying ideas translate into practice."
            ],
            bullets: ["Case studies", "Applied walkthroughs", "Tools commonly used in practice"]
        },
        {
            title: "Advanced Techniques",
            icon: "chart-line",
            paragraphs: [
                "With the basics in place, this unit introduces more advanced techniques and nuances that separate a beginner's understanding from a practitioner's.",
                "This is typically the most challenging unit in the course, so take your time working through it."
            ],
            bullets: ["Advanced methods", "Edge cases and pitfalls", "Performance and optimization considerations"]
        },
        {
            title: "Final Project & Review",
            icon: "flag-checkered",
            paragraphs: [
                "The closing unit ties everything together with a review of the full course and a capstone-style project to apply what you've learned.",
                "Once you've completed this unit, you'll have covered everything needed to mark this course complete."
            ],
            bullets: ["Full course recap", "Capstone project brief", "Next steps after this course"]
        }
    ];
}

// Returns the module for a course.
//
// Known courses (anything in DEFAULT_MODULES) always resolve to the
// LIVE definition above — never a cached copy — so updating the
// content in this file always shows up immediately for every student,
// with no stale localStorage snapshot to clear out.
//
// Admin-added courses that aren't in DEFAULT_MODULES still get a
// generic module generated once and cached, since there's no static
// default to fall back to for those.
function ensureCourseModule(courseId, newCourseTypeHint) {
    if (DEFAULT_MODULES[courseId]) {
        return DEFAULT_MODULES[courseId];
    }

    const all = getAllModules();
    if (all[courseId]) return all[courseId];

    let module;
    if (newCourseTypeHint === 'video') {
        module = {
            type: 'video',
            videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            overview: 'A course overview will be added here soon.',
            topics: []
        };
    } else {
        // Default for any newly-added course with no explicit type: content module
        module = {
            type: 'content',
            overview: 'A course overview will be added here soon.',
            topics: [],
            units: genericUnits()
        };
    }

    all[courseId] = module;
    saveAllModules(all);
    return module;
}

function getCourseModule(courseId) {
    return ensureCourseModule(courseId);
}

// Called when a course is deleted in the admin dashboard, so no
// orphaned content/progress data is left behind in localStorage.
function removeCourseModule(courseId) {
    const all = getAllModules();
    if (all[courseId]) {
        delete all[courseId];
        saveAllModules(all);
    }

    // Progress keys are scoped per-student (unitProgress_<email>_<courseId>),
    // so we sweep localStorage for any key ending in this course's id
    // rather than guessing at a single un-scoped key.
    const suffix = '_' + courseId;
    Object.keys(localStorage).forEach(key => {
        if ((key.startsWith('unitProgress_') || key.startsWith('videoProgress_')) && key.endsWith(suffix)) {
            localStorage.removeItem(key);
        }
    });
}

/* =========================================================================
   PROGRESS TRACKING  (formerly course-progress.js)
   Reads/writes the global `currentStudent` set above, so progress is
   always scoped per logged-in student.
========================================================================= */

/* ===========================================================
   Shared progress-tracking helpers used by course.html.
   Requires course-modules.js to be loaded first (for
   getCourseModule / ensureCourseModule).

   IMPORTANT: progress is scoped per-student (by email), not just
   by courseId. Without this, one student's completed progress
   would leak into every other student's view of the same course,
   since localStorage is shared across the whole browser.
=========================================================== */

// Relies on `currentStudent` already being set as a global by the
// page's own inline script (same pattern used elsewhere in the app).
function progressKey(prefix, courseId) {
    const email = (typeof currentStudent !== 'undefined' && currentStudent) ? currentStudent.email : 'anonymous';
    return prefix + '_' + email + '_' + courseId;
}

// ---------- CONTENT / UNIT-BASED COURSES ----------

function getUnitProgress(courseId, totalUnits) {
    const raw = localStorage.getItem(progressKey('unitProgress', courseId));
    if (raw) {
        try {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr) && arr.length === totalUnits) return arr;
        } catch (e) { /* fall through to default */ }
    }
    return new Array(totalUnits).fill(false);
}

function saveUnitProgress(courseId, arr) {
    localStorage.setItem(progressKey('unitProgress', courseId), JSON.stringify(arr));
}

function toggleAccordion(index) {
    const body = document.getElementById('unitBody' + index);
    const icon = document.getElementById('unitIcon' + index);
    if (!body) return;
    const isOpen = body.classList.contains('open');
    document.querySelectorAll('.unit-body').forEach(b => b.classList.remove('open'));
    document.querySelectorAll('.unit-toggle-icon').forEach(i => i.classList.remove('rotated'));
    if (!isOpen) {
        body.classList.add('open');
        if (icon) icon.classList.add('rotated');
    }
}

function toggleUnit(courseId, index, totalUnits) {
    const arr = getUnitProgress(courseId, totalUnits);
    arr[index] = !arr[index];
    saveUnitProgress(courseId, arr);
    renderUnitProgress(courseId, totalUnits);
    syncEnrollmentStatus(courseId, arr.every(Boolean));
}

function renderUnitProgress(courseId, totalUnits) {
    const arr = getUnitProgress(courseId, totalUnits);
    const done = arr.filter(Boolean).length;
    const pct = totalUnits > 0 ? Math.round((done / totalUnits) * 100) : 0;

    const fill = document.getElementById('unitProgressFill');
    const label = document.getElementById('unitProgressLabel');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = done + ' / ' + totalUnits + ' units completed';

    const pctEl = document.getElementById('unitProgressPct');
    if (pctEl) pctEl.textContent = pct + '%';

    arr.forEach((val, i) => {
        const cb = document.getElementById('unitCheck' + i);
        if (cb) cb.checked = val;
        const item = document.getElementById('unitItem' + i);
        if (item) item.classList.toggle('unit-item--done', val);
    });

    const banner = document.getElementById('courseCompleteBanner');
    if (banner) banner.hidden = !(totalUnits > 0 && done === totalUnits);
}

// ---------- VIDEO-BASED COURSES ----------

function getVideoProgress(courseId) {
    return localStorage.getItem(progressKey('videoProgress', courseId)) === 'true';
}

function toggleVideoComplete(courseId) {
    const cb = document.getElementById('videoCompleteCheck');
    const isDone = !!(cb && cb.checked);
    localStorage.setItem(progressKey('videoProgress', courseId), isDone ? 'true' : 'false');
    updateVideoBadge(courseId);
    syncEnrollmentStatus(courseId, isDone);
}

function updateVideoBadge(courseId) {
    const done = getVideoProgress(courseId);
    const badge = document.getElementById('videoStatusBadge');
    if (badge) {
        badge.textContent = done ? 'Completed' : 'In Progress';
        badge.className = 'db-course-status ' + (done ? 'db-status--done' : 'db-status--progress');
    }
    const cb = document.getElementById('videoCompleteCheck');
    if (cb) cb.checked = done;

    const banner = document.getElementById('courseCompleteBanner');
    if (banner) banner.hidden = !done;
}

// ---------- SHARED: keep the enrollments list in sync ----------

function syncEnrollmentStatus(courseId, isComplete) {
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const email = (typeof currentStudent !== 'undefined' && currentStudent) ? currentStudent.email : null;
    let changed = false;
    const newStatus = isComplete ? 'completed' : 'in-progress';
    enrollments.forEach(en => {
        // Only touch this student's own enrollment record for this course —
        // otherwise one student finishing a course would flip the status
        // for every other student enrolled in it too.
        if (en.courseId === courseId && en.email === email && en.status !== newStatus) {
            en.status = newStatus;
            if (isComplete && !en.completedDate) {
                en.completedDate = new Date().toISOString();
            }
            changed = true;
        }
    });
    if (changed) localStorage.setItem('enrollments', JSON.stringify(enrollments));
}

// ---------- OVERALL PROGRESS % (used by stu-dashboard.html) ----------
// Works for any course, known or newly-added, using the dynamic module.
function getCourseProgressPercent(courseId) {
    const module = getCourseModule(courseId);
    if (module.type === 'video') {
        return getVideoProgress(courseId) ? 100 : 0;
    }
    const total = module.units ? module.units.length : 0;
    if (total === 0) return 0;
    const arr = getUnitProgress(courseId, total);
    return Math.round((arr.filter(Boolean).length / total) * 100);
}

/* =========================================================================
   PAGE: stu-dashboard.html
========================================================================= */

function initStuDashboard(){
    requireStudentLogin();

    // Only ever work with THIS student's own enrollments
    function getEnrollments(){
        const all = JSON.parse(localStorage.getItem('enrollments') || '[]');
        return all.filter(en => en.email === currentStudent.email);
    }

    function saveEnrollments(thisStudentsList){
        // Merge this student's (possibly updated) records back into the full shared list,
        // leaving every other student's enrollments untouched.
        const all = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const others = all.filter(en => en.email !== currentStudent.email);
        localStorage.setItem('enrollments', JSON.stringify([...others, ...thisStudentsList]));
    }

    document.getElementById('studentNameHeading').textContent = currentStudent.name;
    document.getElementById('studentEmailMeta').textContent    = currentStudent.email;

    function emptyState(icon, title, msg, btnText){
        return `<div class="db-empty-state">
            <div class="db-empty-icon"><i class="fa-solid fa-${icon}"></i></div>
            <h3>${title}</h3>
            <p>${msg}</p>
            <a href="courses.html" class="db-empty-btn">${btnText}</a>
        </div>`;
    }

    // Small SVG ring showing overall completion percentage
    function renderRing(pct){
        const size = 108, stroke = 12, r = (size - stroke) / 2, c = 2 * Math.PI * r;
        const offset = c - (pct / 100) * c;
        document.getElementById('overallRing').innerHTML = `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--border)" stroke-width="${stroke}" />
                <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="${stroke}"
                    stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"
                    transform="rotate(-90 ${size/2} ${size/2})" />
                <text x="${size/2}" y="${size/2 + 7}" text-anchor="middle" font-size="22" font-weight="700" fill="var(--navy)" font-family="Inter, sans-serif">${pct}%</text>
            </svg>`;
    }

    function renderDashboard(){
        let enrollments = getEnrollments();

        // Auto-sync status: if a course's real progress hits 100%, flip it to completed
        let changed = false;
        enrollments.forEach(course => {
            const pct = getCourseProgressPercent(course.courseId);
            const shouldBeDone = pct === 100;
            if(shouldBeDone && course.status !== 'completed'){
                course.status = 'completed';
                if (!course.completedDate) course.completedDate = new Date().toISOString();
                changed = true;
            } else if(!shouldBeDone && course.status === 'completed'){
                // progress was reset on the course page, so un-complete it here too
                course.status = 'in-progress';
                changed = true;
            }
        });
        if(changed) saveEnrollments(enrollments);

        const inProgress  = enrollments.filter(e => e.status === 'in-progress');
        const completed   = enrollments.filter(e => e.status === 'completed');

        // Stat counts
        document.getElementById('statEnrolled').textContent   = enrollments.length;
        document.getElementById('statCompleted').textContent  = completed.length;
        document.getElementById('statInProgress').textContent = inProgress.length;
        document.getElementById('statCerts').textContent      = completed.length;

        // ---- OVERALL COMPLETION RING ----
        const overallPct = enrollments.length > 0 ? Math.round((completed.length / enrollments.length) * 100) : 0;
        document.getElementById('overallLabel').textContent = completed.length + ' of ' + enrollments.length + ' courses completed';
        document.getElementById('overallPct').textContent   = overallPct + '%';
        document.getElementById('overallFill').style.width  = overallPct + '%';
        renderRing(overallPct);

        // ---- IN PROGRESS ----
        const ipEl = document.getElementById('inProgressList');
        if(inProgress.length === 0){
            ipEl.innerHTML = emptyState('chart-line','No courses in progress','Once you enrol in a course, your progress will appear here.','Browse Courses');
        } else {
            ipEl.innerHTML = inProgress.map(course => {
                const pct  = getCourseProgressPercent(course.courseId);
                const link = 'course.html?course=' + encodeURIComponent(course.courseId);
                return `<div class="db-course-item" style="flex-direction:column;align-items:stretch;gap:10px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
                        <div class="db-course-item-left">
                            <div class="db-course-item-icon"><i class="fa-solid fa-book-open"></i></div>
                            <div>
                                <p class="db-course-item-name">${course.courseName}</p>
                                <p class="db-course-item-meta"><i class="fa-solid fa-user"></i> ${course.name} &nbsp;·&nbsp; <i class="fa-solid fa-id-card"></i> ${course.roll}</p>
                            </div>
                        </div>
                        <a href="${link}" class="db-complete-btn" style="text-decoration:none;">
                            <i class="fa-solid fa-play"></i> Continue
                        </a>
                    </div>
                    <div>
                        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
                        <span style="font-size:11.5px;color:var(--text-muted);">${pct}% complete</span>
                    </div>
                </div>`;
            }).join('');
        }

        // ---- MY COURSES (ALL) ----
        const mcEl = document.getElementById('myCoursesList');
        if(enrollments.length === 0){
            mcEl.innerHTML = emptyState('book-bookmark','No courses enrolled yet','Enrol in your first course to see it listed here.','Start Learning');
        } else {
            mcEl.innerHTML = enrollments.map(course => {
                const done = course.status === 'completed';
                const pct  = getCourseProgressPercent(course.courseId);
                return `<div class="db-course-item" style="flex-direction:column;align-items:stretch;gap:10px;">
                    <div class="db-course-item-left">
                        <div class="db-course-item-icon ${done ? 'db-course-item-icon--done' : ''}">
                            <i class="fa-solid fa-${done ? 'circle-check' : 'book-open'}"></i>
                        </div>
                        <div>
                            <p class="db-course-item-name">${course.courseName}</p>
                            <span class="db-course-status ${done ? 'db-status--done' : 'db-status--progress'}">
                                ${done ? 'Completed' : 'In Progress'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
                        <span style="font-size:11.5px;color:var(--text-muted);">${pct}% complete</span>
                    </div>
                </div>`;
            }).join('');
        }

        // ---- COMPLETED ----
        const compEl = document.getElementById('completedList');
        if(completed.length === 0){
            compEl.innerHTML = emptyState('trophy','No completions yet','Courses you finish will appear here along with your certificates.','Explore Courses');
        } else {
            compEl.innerHTML = completed.map(course => {
                const certLink = 'certificate.html?course=' + encodeURIComponent(course.courseId) +
                    '&name=' + encodeURIComponent(course.name) +
                    '&roll=' + encodeURIComponent(course.roll);
                return `<div class="db-course-item">
                    <div class="db-course-item-left">
                        <div class="db-course-item-icon db-course-item-icon--done">
                            <i class="fa-solid fa-circle-check"></i>
                        </div>
                        <div>
                            <p class="db-course-item-name">${course.courseName}</p>
                            <p class="db-course-item-meta"><i class="fa-solid fa-user"></i> ${course.name} &nbsp;·&nbsp; <i class="fa-solid fa-id-card"></i> ${course.roll}</p>
                        </div>
                    </div>
                    <a href="${certLink}" class="db-cert-badge" style="text-decoration:none;">
                        <i class="fa-solid fa-certificate"></i> View Certificate
                    </a>
                </div>`;
            }).join('');
        }
    }

    renderDashboard();
    
}

/* =========================================================================
   PAGE: notifications.html
========================================================================= */

function initNotifications(){
    requireStudentLogin();

    // Only ever work with THIS student's own enrollments
    function getEnrollments(){
        const all = JSON.parse(localStorage.getItem('enrollments') || '[]');
        return all.filter(en => en.email === currentStudent.email);
    }

    // New courses are a global, admin-managed list (same source courses.html reads)
    function getNewCourses(){
        try{
            return JSON.parse(localStorage.getItem('newCourses') || '[]');
        }catch(e){
            return [];
        }
    }

    function getReadIds(){
        try{
            return JSON.parse(localStorage.getItem('notificationsRead_' + currentStudent.email) || '[]');
        }catch(e){
            return [];
        }
    }

    function saveReadIds(ids){
        localStorage.setItem('notificationsRead_' + currentStudent.email, JSON.stringify(ids));
    }

    function timeAgo(iso){
        if (!iso) return 'New';
        const then = new Date(iso).getTime();
        if (isNaN(then)) return 'New';
        const diffMs = Date.now() - then;
        const mins  = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMs / 3600000);
        const days  = Math.floor(diffMs / 86400000);
        if (mins < 1)   return 'Just now';
        if (mins < 60)  return mins + (mins === 1 ? ' minute ago' : ' minutes ago');
        if (hours < 24) return hours + (hours === 1 ? ' hour ago' : ' hours ago');
        if (days < 30)  return days + (days === 1 ? ' day ago' : ' days ago');
        return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Build the notification feed on the fly — there's no separate
    // "notifications" store. Items are derived from real data already
    // sitting in localStorage: admin-added courses, and this student's
    // own enrollment records.
    function buildNotifications(){
        const enrollments = getEnrollments();
        const newCourses  = getNewCourses();
        const items = [];

        items.push({
            id: 'welcome',
            type: 'course',
            icon: 'hand-sparkles',
            title: 'Welcome to LearnHub!',
            message: 'Browse the course catalog and enroll to start tracking your learning journey here.',
            date: enrollments.length ? enrollments[0].date : null,
            link: 'courses.html'
        });

        // ---- New Course Alerts ----
        newCourses.forEach(c => {
            const category = c.category || c.section || 'Other';
            items.push({
                id: 'course-' + c.id,
                type: 'course',
                icon: 'circle-plus',
                title: 'New Course Added: ' + c.title,
                message: 'A new ' + (c.level || '') + ' course in ' + category +
                          (c.instructor ? ' — taught by ' + c.instructor : '') + '.',
                date: c.dateAdded || null,
                link: 'courses.html'
            });
        });

        // ---- Enrollment Confirmations + Completion Certificates ----
        enrollments.forEach(en => {
            items.push({
                id: 'enroll-' + en.courseId,
                type: 'enrollment',
                icon: 'graduation-cap',
                title: 'Enrolled in ' + en.courseName,
                message: "You successfully enrolled in this course. Jump back in whenever you're ready.",
                date: en.date,
                link: 'courses.html'
            });

            if (en.status === 'completed'){
                items.push({
                    id: 'complete-' + en.courseId,
                    type: 'certificate',
                    icon: 'trophy',
                    title: 'Course Completed: ' + en.courseName,
                    message: 'Great work! Your certificate is ready to view and download.',
                    date: en.completedDate || en.date,
                    link: 'certificate.html?course=' + encodeURIComponent(en.courseId) +
                          '&name=' + encodeURIComponent(en.name) + '&roll=' + encodeURIComponent(en.roll)
                });
            }
        });

        // Most recent first — items with no date (e.g. new course alerts
        // with no dateAdded) are treated as newest and sorted to the top.
        items.sort((a, b) => {
            const at = a.date ? new Date(a.date).getTime() : Date.now();
            const bt = b.date ? new Date(b.date).getTime() : Date.now();
            return bt - at;
        });
        return items;
    }

    function markAsRead(id){
        const read = getReadIds();
        if (!read.includes(id)){
            read.push(id);
            saveReadIds(read);
        }
    }

    window.markAllRead = markAllRead;
    window.openNotification = openNotification;

    function markAllRead(){
        const all = buildNotifications().map(n => n.id);
        saveReadIds(all);
        render();
    }

    function openNotification(id, link){
        markAsRead(id);
        if (link) window.location.href = link;
        else render();
    }

    function notifItemHtml(n, readIds){
        const isUnread = !readIds.includes(n.id);
        return `<div class="db-course-item notif-item ${isUnread ? 'notif-item--unread' : ''}"
                    onclick="openNotification('${n.id}', '${n.link || ''}')" style="cursor:pointer;">
            <div class="db-course-item-left">
                <div class="notif-icon-wrap type-${n.type}">
                    <i class="fa-solid fa-${n.icon}"></i>
                </div>
                <div>
                    <p class="db-course-item-name">
                        ${n.title}
                        ${isUnread ? '<span class="notif-dot"></span>' : ''}
                    </p>
                    <p class="db-course-item-meta">${n.message}</p>
                </div>
            </div>
            <span style="font-size:11.5px;color:var(--text-muted);white-space:nowrap;">${timeAgo(n.date)}</span>
        </div>`;
    }

    function render(){
        const all = buildNotifications();
        const readIds = getReadIds();

        // Certificates get pulled out into their own section — everything
        // else (welcome, new course alerts, enrollment confirmations) stays
        // in the general feed.
        const certificates   = all.filter(n => n.type === 'certificate');
        const notifications  = all.filter(n => n.type !== 'certificate');

        const unreadCount = all.filter(n => !readIds.includes(n.id)).length;

        document.getElementById('unreadSummary').textContent =
            unreadCount === 0 ? "You're all caught up" :
            unreadCount === 1 ? '1 unread notification' :
            unreadCount + ' unread notifications';

        const listEl = document.getElementById('notificationsList');
        if (notifications.length === 0){
            listEl.innerHTML = `<div class="db-empty-state">
                <div class="db-empty-icon"><i class="fa-solid fa-bell-slash"></i></div>
                <h3>No notifications yet</h3>
                <p>Enroll in a course to start seeing updates here.</p>
                <a href="courses.html" class="db-empty-btn">Browse Courses</a>
            </div>`;
        } else {
            listEl.innerHTML = notifications.map(n => notifItemHtml(n, readIds)).join('');
        }

        const certEl = document.getElementById('certificatesList');
        if (certificates.length === 0){
            certEl.innerHTML = `<div class="db-empty-state">
                <div class="db-empty-icon"><i class="fa-solid fa-certificate"></i></div>
                <h3>No certificates yet</h3>
                <p>Complete a course to earn your first certificate — it'll show up here.</p>
                <a href="stu-dashboard.html" class="db-empty-btn">View My Courses</a>
            </div>`;
        } else {
            certEl.innerHTML = certificates.map(n => notifItemHtml(n, readIds)).join('');
        }
    }

    render();
    
}

/* =========================================================================
   PAGE: certificate.html
========================================================================= */

function initCertificate(){
    requireStudentLogin();

    function getEnrollments(){
        const all = JSON.parse(localStorage.getItem('enrollments') || '[]');
        return all.filter(en => en.email === currentStudent.email);
    }

    function formatDate(iso){
        try{
            const d = new Date(iso);
            return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }catch(e){
            return 'N/A';
        }
    }

    function init(){
        const params   = new URLSearchParams(window.location.search);
        const courseId = params.get('course');

        // Only ever look within the logged-in student's own enrollments —
        // this also prevents viewing someone else's certificate by guessing a URL.
        const enrollments = getEnrollments();
        const record = enrollments.find(en => en.courseId === courseId);

        if(!record){
            document.getElementById('notCompletedTitle').textContent = 'No enrollment found';
            document.getElementById('notCompletedMsg').textContent = "We couldn't find an enrollment matching this course under your account.";
            document.getElementById('notCompletedState').hidden = false;
            return;
        }

        if(record.status !== 'completed'){
            document.getElementById('notCompletedState').hidden = false;
            return;
        }

        document.getElementById('certWrap').hidden = false;
        document.getElementById('certStudentName').textContent = record.name;
        document.getElementById('certCourseName').textContent  = record.courseName;
        document.getElementById('certRoll').textContent        = record.roll;
        document.getElementById('certDate').textContent        = formatDate(record.date);

        const certId = (record.courseId + '-' + record.roll).toUpperCase().replace(/\s+/g, '');
        document.getElementById('certId').textContent = 'Certificate ID: ' + certId;

        document.title = 'Certificate - ' + record.courseName + ' | LearnHub';
    }

    init();
    
}

/* =========================================================================
   PAGE: courses.html
========================================================================= */

function initCourses(){
    // Render any courses the admin has added, into their matching section.
    // If the admin used a brand-new category that doesn't have a section on
    // this page yet, one is created automatically instead of the course
    // silently failing to appear.
    const newCourses = JSON.parse(localStorage.getItem("newCourses") || "[]");

    function getOrCreateSectionGrid(sectionKey, categoryLabel){
        let sectionEl = document.querySelector('.course-section[data-section="' + sectionKey + '"]');
        if (sectionEl) return sectionEl.querySelector('.courses-grid');

        sectionEl = document.createElement('section');
        sectionEl.className = 'course-section';
        sectionEl.dataset.section = sectionKey;
        sectionEl.innerHTML = `
            <div class="section-header">
                <div class="section-title-group">
                    <div class="section-icon"><i class="fa-solid fa-layer-group"></i></div>
                    <div>
                        <h2>${categoryLabel}</h2>
                        <p class="section-count">0 Courses</p>
                    </div>
                </div>
                <a href="add-course-edit.html" class="admin-section-btn">
                    <i class="fa-solid fa-plus"></i> Add Course
                </a>
            </div>
            <div class="courses-grid"></div>`;

        document.querySelector('.courses-main').appendChild(sectionEl);
        return sectionEl.querySelector('.courses-grid');
    }

    newCourses.forEach(c => {
        const categoryLabel = c.category || c.section || 'Other';
        const sectionKey    = c.section || slugify(categoryLabel);
        const section       = getOrCreateSectionGrid(sectionKey, categoryLabel);

        const badgeClass = c.level === "Intermediate" ? "c-badge c-badge-inter"
                          : c.level === "Advanced"     ? "c-badge c-badge-adv"
                          : "c-badge";

        const card = document.createElement("div");
        card.className = "c-card";
        card.dataset.id   = c.id;
        card.dataset.name = c.title;
        card.innerHTML = `
            <div class="c-card-body">
                <span class="${badgeClass}">${c.level}</span>
                <h3>${c.title}</h3>
                <div class="c-duration"><i class="fa-regular fa-clock"></i> ${c.duration.split('·')[0].trim()}</div>
                <div class="c-meta">
                    <span><i class="fa-solid fa-star"></i> ${c.rating}</span>
                </div>
                <div class="c-card-actions">
                    <button type="button" class="enroll-btn" onclick="openEnrollModal(this)"><i class="fa-solid fa-graduation-cap"></i> Enroll</button>
                    <a href="edit-course-login.html?course=${c.id}" class="admin-edit-btn" title="Edit Course"><i class="fa-solid fa-pen-to-square"></i></a>
                </div>
                <details class="c-details">
                    <summary class="view-details-btn"><i class="fa-solid fa-chevron-down"></i> View Details</summary>
                    <div class="c-details-body">
                        <p><strong>Instructor:</strong> ${c.instructor}</p>
                        <p><strong>Duration:</strong> ${c.duration}</p>
                        <p><strong>Topics:</strong> ${c.topics}</p>
                        <p><strong>Outcome:</strong> ${c.outcome}</p>
                    </div>
                </details>
            </div>`;
        section.appendChild(card);
    });

    // Remove any courses the admin has deleted, then refresh each section's course count
    const deletedCourses = JSON.parse(localStorage.getItem("deletedCourses") || "[]");
    deletedCourses.forEach(id => {
        const card = document.querySelector('.c-card[data-id="' + id + '"]');
        if (card) card.remove();
    });

    document.querySelectorAll('.course-section').forEach(section => {
        const countEl = section.querySelector('.section-count');
        if (!countEl) return;
        const remaining = section.querySelectorAll('.c-card').length;
        countEl.textContent = remaining + (remaining === 1 ? " Course" : " Courses");
    });

    // Read any saved course edits from localStorage and update cards live
    document.querySelectorAll('.c-card[data-id]').forEach(card => {
        const id      = card.dataset.id;
        const saved   = localStorage.getItem('course_' + id);
        if (!saved) return;
        const c = JSON.parse(saved);

        // Title
        if (c.title)      card.querySelector('h3').textContent = c.title;

        // Duration badge
        if (c.duration){
            const dur = card.querySelector('.c-duration');
            if (dur) dur.innerHTML = '<i class="fa-regular fa-clock"></i> ' + c.duration.split('·')[0].trim();
        }

        // Rating
        if (c.rating){
            const rat = card.querySelector('.c-meta span');
            if (rat) rat.innerHTML = '<i class="fa-solid fa-star"></i> ' + c.rating;
        }

        // Level badge
        if (c.level){
            const badge = card.querySelector('.c-badge');
            if (badge){
                badge.textContent = c.level;
                badge.className   = 'c-badge' +
                    (c.level === 'Intermediate' ? ' c-badge-inter' :
                     c.level === 'Advanced'     ? ' c-badge-adv'   : '');
            }
        }

        // Details body — p[0]=Instructor, p[1]=Duration, p[2]=Topics, p[3]=Outcome
        const body = card.querySelector('.c-details-body');
        if (body){
            const p = body.querySelectorAll('p');
            if (p[0] && c.instructor) p[0].innerHTML = '<strong>Instructor:</strong> ' + c.instructor;
            if (p[1] && c.duration)   p[1].innerHTML = '<strong>Duration:</strong> '   + c.duration;
            if (p[2] && c.topics)     p[2].innerHTML = '<strong>Topics:</strong> '     + c.topics;
            if (p[3] && c.prereqs)    p[3].innerHTML = '<strong>Prerequisites:</strong> ' + c.prereqs;
        }
    });

    // ================= ENROLLMENT MODAL LOGIC =================
    let currentEnrollCard = null;
    const enrollOverlay    = document.getElementById('enrollModalOverlay');
    const enrollFormStep   = document.getElementById('enrollFormStep');
    const enrollSuccessStep= document.getElementById('enrollSuccessStep');

    window.openEnrollModal  = openEnrollModal;
    window.closeEnrollModal = closeEnrollModal;
    window.submitEnrollment = submitEnrollment;

    (function renderNavAuth(){
        const student = getCurrentStudent();
        const area = document.getElementById('navAuthArea');
        if (!area) return;
        if (student){
            area.innerHTML = `<a href="#" class="login-btn" onclick="logoutStudent(); return false;">
                <i class="fa-solid fa-right-from-bracket"></i> Logout (${student.name})
            </a>`;

            // Once logged in, swap the Notifications tab for a direct
            // Student Dashboard link instead.
            const notifItem = document.getElementById('notifNavItem');
            if (notifItem){
                notifItem.innerHTML = '<a href="stu-dashboard.html">Student Dashboard</a>';
            }
        }
    })();

    function openEnrollModal(btn){
        const student = getCurrentStudent();
        if (!student){
            if (confirm('Please log in to enroll in a course. Go to the login page now?')){
                window.location.href = 'stu-login.html';
            }
            return;
        }

        currentEnrollCard = btn.closest('.c-card');
        const courseName  = currentEnrollCard ? currentEnrollCard.dataset.name : 'this course';

        document.getElementById('enrollCourseName').textContent = courseName;
        document.getElementById('enrollStudentName').value = student.name;
        document.getElementById('enrollStudentName').readOnly = true;
        document.getElementById('enrollRollNo').value = '';
        document.getElementById('enrollFormError').textContent = '';

        enrollFormStep.style.display    = 'block';
        enrollSuccessStep.style.display = 'none';

        enrollOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeEnrollModal(){
        enrollOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function submitEnrollment(e){
        if (e) e.preventDefault();

        const student = getCurrentStudent();
        if (!student){
            window.location.href = 'stu-login.html';
            return false;
        }

        const name    = document.getElementById('enrollStudentName').value.trim();
        const roll    = document.getElementById('enrollRollNo').value.trim();
        const errorEl = document.getElementById('enrollFormError');

        if (!name || !roll){
            errorEl.textContent = 'Please fill in both your name and roll number.';
            return false;
        }
        errorEl.textContent = '';

        const courseName = currentEnrollCard ? currentEnrollCard.dataset.name : 'this course';
        const courseId    = currentEnrollCard ? currentEnrollCard.dataset.id   : '';

        // Save the enrollment record for later use (dashboard counts are not wired up yet)
        const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');

        // Prevent this logged-in student from being enrolled in the same course twice
        const alreadyEnrolled = enrollments.some(en =>
            en.courseId === courseId &&
            en.email === student.email
        );

        if (alreadyEnrolled){
            errorEl.textContent = 'You are already enrolled in this course.';
            return false;
        }

        enrollments.push({ courseId, courseName, name, roll, email: student.email, status: 'in-progress', date: new Date().toISOString() });
        localStorage.setItem('enrollments', JSON.stringify(enrollments));

        document.getElementById('enrollSuccessName').textContent   = name;
        document.getElementById('enrollSuccessCourse').textContent = courseName;

        enrollFormStep.style.display    = 'none';
        enrollSuccessStep.style.display = 'block';

        // Every course now uses the single dynamic course.html template
        const targetPage = 'course.html?course=' + encodeURIComponent(courseId);

        const startBtn = document.getElementById('startLearningBtn');
        if (startBtn) startBtn.href = targetPage;

        const note = document.getElementById('autoRedirectNote');
        if (note) note.textContent = 'Taking you to the course in a couple of seconds...';

        // Auto-redirect into the course content/video page shortly after enrolling
        setTimeout(function () {
            window.location.href = targetPage;
        }, 1800);

        return false;
    }

    // Close modal when clicking outside the box
    enrollOverlay.addEventListener('click', function(e){
        if (e.target === this) closeEnrollModal();
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && enrollOverlay.classList.contains('active')) closeEnrollModal();
    });
    
}

/* =========================================================================
   PAGE: course.html
========================================================================= */

function initCoursePage(){
    // Same base catalog used by admin-dashboard.html / courses.html,
    // so this page can show correct titles/category/level/duration
    // for both the original 9 courses and any admin-added ones.
    // Identify the logged-in student (if any) so unit/video progress on
    // this page is scoped to their account, matching the dashboard.
    currentStudent = getCurrentStudent();

    const BASE_COURSES = [
        {id:"ai1",  title:"Introduction to AI",            category:"Artificial Intelligence", level:"Beginner",     duration:"8 Weeks"},
        {id:"ai2",  title:"Machine Perception",            category:"Artificial Intelligence", level:"Intermediate", duration:"10 Weeks"},
        {id:"ai3",  title:"AI for Healthcare",             category:"Artificial Intelligence", level:"Advanced",     duration:"12 Weeks"},
        {id:"ai4",  title:"Reinforcement Learning",        category:"Artificial Intelligence", level:"Advanced",     duration:"14 Weeks"},
        {id:"ai5",  title:"Generative AI",                 category:"Artificial Intelligence", level:"Intermediate", duration:"10 Weeks"},
        {id:"ml1",  title:"ML Fundamentals",               category:"Machine Learning",        level:"Beginner",     duration:"10 Weeks"},
        {id:"ml2",  title:"Feature Engineering",           category:"Machine Learning",        level:"Intermediate", duration:"8 Weeks"},
        {id:"ml3",  title:"Deep Learning with TensorFlow", category:"Machine Learning",        level:"Advanced",     duration:"14 Weeks"},
        {id:"ml4",  title:"ML Deployment & MLOps",         category:"Machine Learning",        level:"Advanced",     duration:"10 Weeks"}
    ];

    function getCourseMeta(courseId){
        const newCourses = JSON.parse(localStorage.getItem('newCourses') || '[]');
        const all = [...BASE_COURSES, ...newCourses];
        let course = all.find(c => c.id === courseId);
        if(course){
            const saved = localStorage.getItem('course_' + courseId);
            if(saved) course = { ...course, ...JSON.parse(saved) };
        }
        return course;
    }

    let currentCourseId = null;
    let currentModule   = null;

    function buildAccordion(units){
        const wrap = document.getElementById('unitAccordion');
        wrap.innerHTML = units.map((u, i) => {
            const paras = (u.paragraphs || []).map(p => `<p>${p}</p>`).join('');
            const bullets = (u.bullets || []).map(b => `<li>${b}</li>`).join('');
            const icon = u.icon || 'circle';
            return `<div class="unit-item" id="unitItem${i}">
                <div class="unit-header" onclick="toggleAccordion(${i})">
                    <div class="unit-header-main">
                        <div class="unit-number">${i + 1}</div>
                        <div class="unit-title"><i class="fa-solid fa-${icon}"></i> Unit ${i + 1}: ${u.title}</div>
                    </div>
                    <label class="unit-checkbox-label" onclick="event.stopPropagation()">
                        <input type="checkbox" id="unitCheck${i}" onchange="handleUnitToggle(${i})">
                        Mark complete
                    </label>
                    <i class="fa-solid fa-chevron-down unit-toggle-icon" id="unitIcon${i}"></i>
                </div>
                <div class="unit-body" id="unitBody${i}">
                    ${paras}
                    <ul>${bullets}</ul>
                </div>
            </div>`;
        }).join('');
    }

    function renderTopics(topics){
        const card = document.getElementById('sidebarTopicsCard');
        const list = document.getElementById('topicsList');
        if (!topics || topics.length === 0){
            card.hidden = true;
            return;
        }
        card.hidden = false;
        list.innerHTML = topics.map(t =>
            `<li><i class="fa-solid fa-circle-check"></i> ${t}</li>`
        ).join('');
    }

    window.handleUnitToggle  = handleUnitToggle;
    window.handleVideoToggle = handleVideoToggle;

    function handleUnitToggle(index){
        toggleUnit(currentCourseId, index, currentModule.units.length);
    }

    function handleVideoToggle(){
        toggleVideoComplete(currentCourseId);
    }

    function init(){
        const params = new URLSearchParams(window.location.search);
        currentCourseId = params.get('course');

        const meta = currentCourseId ? getCourseMeta(currentCourseId) : null;

        if(!currentCourseId || !meta){
            document.getElementById('courseNotFound').hidden = false;
            return;
        }

        document.getElementById('pageTitle').textContent = meta.title + ' | LearnHub';
        document.getElementById('coursePageTitle').textContent = meta.title;
        document.getElementById('coursePageCategory').textContent = meta.category + ' \u00b7 ' + meta.level;

        document.getElementById('infoDuration').textContent = meta.duration;
        document.getElementById('infoLevel').textContent = meta.level;
        document.getElementById('infoCategory').textContent = meta.category;

        currentModule = getCourseModule(currentCourseId);

        document.getElementById('courseOverviewText').textContent =
            currentModule.overview || ('Welcome to ' + meta.title + '. Explore the material below at your own pace.');

        renderTopics(currentModule.topics);

        const isContent = currentModule.type === 'content';
        document.getElementById('courseContent').hidden = false;
        document.getElementById('contentModuleUI').hidden = !isContent;
        document.getElementById('videoModuleUI').hidden = isContent;
        document.getElementById('sidebarProgressCard').hidden = !isContent;
        document.getElementById('infoFormat').textContent = isContent ? 'Self-paced content' : 'Video course';

        if(isContent){
            const total = currentModule.units.length;
            document.getElementById('coursePageMeta').innerHTML =
                `<i class="fa-regular fa-clock"></i> ${meta.duration} &nbsp;&middot;&nbsp; ${total} Units &nbsp;&middot;&nbsp; Self-paced content course`;
            document.getElementById('completeBannerText').textContent = "You've completed all units of this course. Great work!";
            buildAccordion(currentModule.units);
            renderUnitProgress(currentCourseId, total);
        } else {
            document.getElementById('coursePageMeta').innerHTML =
                `<i class="fa-regular fa-clock"></i> ${meta.duration} &nbsp;&middot;&nbsp; Video course`;
            document.getElementById('completeBannerText').textContent = "You've marked this course as completed. Great work!";
            document.getElementById('videoSource').src = currentModule.videoSrc;
            document.getElementById('videoPlayer').load();
            updateVideoBadge(currentCourseId);
        }
    }

    init();
    
}

/* =========================================================================
   PAGE: admin-dashboard.html
========================================================================= */

function initAdminDashboard(){
    const BASE_COURSES = [
        {id:"ai1",  title:"Introduction to AI",            category:"Artificial Intelligence", level:"Beginner",     duration:"8 Weeks",  rating:"4.8"},
        {id:"ai2",  title:"Machine Perception",            category:"Artificial Intelligence", level:"Intermediate", duration:"10 Weeks", rating:"4.7"},
        {id:"ai3",  title:"AI for Healthcare",             category:"Artificial Intelligence", level:"Advanced",     duration:"12 Weeks", rating:"4.9"},
        {id:"ai4",  title:"Reinforcement Learning",        category:"Artificial Intelligence", level:"Advanced",     duration:"14 Weeks", rating:"4.6"},
        {id:"ai5",  title:"Generative AI",                 category:"Artificial Intelligence", level:"Intermediate", duration:"10 Weeks", rating:"4.9"},
        {id:"ml1",  title:"ML Fundamentals",               category:"Machine Learning",        level:"Beginner",     duration:"10 Weeks", rating:"4.8"},
        {id:"ml2",  title:"Feature Engineering",           category:"Machine Learning",        level:"Intermediate", duration:"8 Weeks",  rating:"4.6"},
        {id:"ml3",  title:"Deep Learning with TensorFlow", category:"Machine Learning",        level:"Advanced",     duration:"14 Weeks", rating:"4.9"},
        {id:"ml4",  title:"ML Deployment & MLOps",         category:"Machine Learning",        level:"Advanced",     duration:"10 Weeks", rating:"4.7"}
    ];

    window.deleteCourse     = deleteCourse;
    window.resetEnrollments = resetEnrollments;

    function levelBadge(level){
        const cls = level==='Beginner'?'beg': level==='Intermediate'?'int':'adv';
        return `<span class="tbl-badge tbl-badge--${cls}">${level}</span>`;
    }

    function deleteCourse(id){
        if(!confirm('Delete this course? This cannot be undone.')) return;
        const deleted = JSON.parse(localStorage.getItem('deletedCourses') || '[]');
        if(!deleted.includes(id)) deleted.push(id);
        localStorage.setItem('deletedCourses', JSON.stringify(deleted));
        removeCourseModule(id); // clean up its content/units/video + progress data
        render();
    }

    function resetEnrollments(){
        if(!confirm('Clear all enrollment data? This cannot be undone.')) return;
        localStorage.removeItem('enrollments');
        render();
        renderEnrollments();
    }

    function render(){
        const newCourses  = JSON.parse(localStorage.getItem('newCourses')     || '[]');
        const deleted     = JSON.parse(localStorage.getItem('deletedCourses') || '[]');
        const enrollments = JSON.parse(localStorage.getItem('enrollments')    || '[]');

        // Merge base + new, remove deleted, apply any edits
        const allCourses = [...BASE_COURSES, ...newCourses]
            .filter(c => !deleted.includes(c.id))
            .map(c => {
                const saved = localStorage.getItem('course_' + c.id);
                return saved ? { ...c, ...JSON.parse(saved) } : c;
            });

        // Stats
        const totalEnrolled  = enrollments.length;
        const totalCompleted = enrollments.filter(e => e.status === 'completed').length;
        const pct = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

        document.getElementById('statTotalCourses').textContent  = allCourses.length;
        document.getElementById('statTotalEnrolled').textContent  = totalEnrolled;
        document.getElementById('statTotalCompleted').textContent = totalCompleted;
        document.getElementById('progressFill').style.width       = pct + '%';
        document.getElementById('progressPct').textContent        = pct + '%';

        // Table
        const tbody = document.getElementById('coursesTableBody');
        if(allCourses.length === 0){
            tbody.innerHTML = `<tr><td class="admin-table-empty" colspan="7">No courses found.</td></tr>`;
            return;
        }

        // Inside the render() function
// Remove the <td> containing the enrollments logic
tbody.innerHTML = allCourses.map(c => {
    return `<tr>
        <td><strong>${c.title}</strong></td>
        <td>${c.category}</td>
        <td>${levelBadge(c.level)}</td>
        <td>${c.duration}</td>
        <td><i class="fa-solid fa-star" style="color:var(--accent);font-size:11px;margin-right:3px;"></i>${c.rating}</td>
        <td>
            <div class="tbl-actions">
                <a href="edit-course-login.html?course=${c.id}" class="tbl-edit-btn">
                    <i class="fa-solid fa-pen-to-square"></i> Edit
                </a>
                <button class="tbl-delete-btn" onclick="deleteCourse('${c.id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </td>
    </tr>`;
}).join('');
    }

    render();
    function renderEnrollments() {
        const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const tbody = document.getElementById('enrollmentsTableBody');

        if (enrollments.length === 0) {
            tbody.innerHTML = `<tr><td class="admin-table-empty" colspan="4">No enrollments yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = enrollments.map(en => {
            const done = en.status === 'completed';
            return `<tr>
                <td><strong>${en.courseName}</strong></td>
                <td>${en.name}</td>
                <td>${en.roll}</td>
                <td>
                    <span class="db-course-status ${done ? 'db-status--done' : 'db-status--progress'}">
                        ${done ? 'Completed' : 'Pending'}
                    </span>
                </td>
            </tr>`;
        }).join('');
    }
    renderEnrollments();
    
}

/* =========================================================================
   PAGE: admin-login.html
========================================================================= */

function initAdminLogin(){
    verifyAdminLogin("verifyLoginForm", "adminEmail", "adminPassword", "admin-dashboard.html");
}

/* =========================================================================
   PAGE: add-course-edit.html
========================================================================= */

function initAddCourseEdit(){
    verifyAdminLogin("verifyLoginForm", "adminEmail", "adminPassword", "add-course.html");
}

/* =========================================================================
   PAGE: edit-course-login.html
========================================================================= */

function initEditCourseLogin(){
    const params   = new URLSearchParams(window.location.search);
    const courseId = params.get("course") || "";
    verifyAdminLogin("verifyLoginForm", "adminEmail", "adminPassword", function(){
        return "edit-course.html?course=" + courseId;
    });
}

/* =========================================================================
   PAGE: add-course.html
========================================================================= */

function initAddCourse(){
    document.getElementById("addCourseForm").addEventListener("submit", function(e) {
        e.preventDefault();

        const title      = document.getElementById("courseName").value.trim();
        const category   = document.getElementById("courseCategory").value.trim();
        const level      = document.getElementById("courseLevel").value;
        const weeks      = document.getElementById("courseWeeks").value.trim();
        const hours      = document.getElementById("courseHours").value.trim();
        const instructor = document.getElementById("courseInstructor").value.trim();
        const rating     = document.getElementById("courseRating").value.trim();
        const topics     = document.getElementById("courseTopics").value.trim();
        const outcome    = document.getElementById("courseOutcome").value.trim();

        const errorEl = document.getElementById("formError");

        // Validate required fields
        if (!title || !category || !level || !weeks || !hours || !instructor || !topics || !outcome) {
            errorEl.hidden = false;
            errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        errorEl.hidden = true;

        // Turn whatever category text the admin typed into a URL/id-safe key,
        // e.g. "Cloud Computing" -> "cloud-computing". This is what courses.html
        // uses to group courses into a section (creating a new section
        // automatically if this category hasn't been used before).
        const section = slugify(category);

        // Build a unique id for this course
        const id = "new" + Date.now();

        const newCourse = {
            id,
            title,
            instructor,
            duration: weeks + " Weeks · " + hours + " Hours",
            rating: rating || "New",
            level,
            category,
            section,
            image: "https://picsum.photos/seed/" + id + "/400/220",
            topics,
            prereqs: "",
            outcome
        };

        // Save alongside any other admin-added courses
        const newCourses = JSON.parse(localStorage.getItem("newCourses") || "[]");
        newCourses.push(newCourse);
        localStorage.setItem("newCourses", JSON.stringify(newCourses));

        alert("Course added successfully!\n\nCourse: " + title);
        window.location.href = "courses.html";
    });
    
}

/* =========================================================================
   PAGE: edit-course.html
========================================================================= */

function initEditCourse(){
    // ===================== COURSE DATA =====================
    const COURSES = {
        ai1:  { title:"Introduction to AI",            instructor:"Dr. Alan Turing",     duration:"8 Weeks · 40 Hours",  rating:"4.8", level:"Beginner",     section:"ai",  image:"https://picsum.photos/seed/ai1/400/220",  topics:"History of AI,Search Algorithms,Knowledge Representation,Expert Systems,AI Ethics",       prereqs:"Basic programming knowledge. No prior AI experience needed.",        learn:["Understand the history and evolution of Artificial Intelligence","Implement basic search algorithms like BFS and DFS","Apply knowledge representation techniques","Build simple rule-based expert systems","Explore real-world AI applications across industries"] },
        ai2:  { title:"Machine Perception",            instructor:"Prof. Yann LeCun",    duration:"10 Weeks · 50 Hours", rating:"4.7", level:"Intermediate", section:"ai",  image:"https://picsum.photos/seed/ai2/400/220",  topics:"Computer Vision Basics,Image Processing,Object Detection,CNNs,Transfer Learning",          prereqs:"Python programming and basic ML knowledge required.",                learn:["Process and analyze image data using Python libraries","Implement object detection algorithms","Build Convolutional Neural Networks (CNNs) from scratch","Apply transfer learning to visual recognition tasks","Deploy a working image classification system"] },
        ai3:  { title:"AI for Healthcare",             instructor:"Dr. Eric Topol",      duration:"12 Weeks · 60 Hours", rating:"4.9", level:"Advanced",     section:"ai",  image:"https://picsum.photos/seed/ai3/400/220",  topics:"Medical Imaging,Diagnostics,Drug Discovery,Healthcare Ethics,Clinical NLP",               prereqs:"Deep learning fundamentals and Python proficiency required.",         learn:["Apply AI to medical imaging and diagnostic workflows","Build predictive models for patient outcome analysis","Understand drug discovery pipelines powered by AI","Navigate ethics and regulations in healthcare AI","Work with real-world clinical datasets"] },
        ai4:  { title:"Reinforcement Learning",        instructor:"Prof. David Silver",  duration:"14 Weeks · 70 Hours", rating:"4.6", level:"Advanced",     section:"ai",  image:"https://picsum.photos/seed/ai4/400/220",  topics:"Q-Learning,Policy Gradients,Deep RL,OpenAI Gym,MDPs",                                    prereqs:"Strong ML background and Python required. Linear algebra helpful.",   learn:["Understand Markov Decision Processes and reward structures","Implement Q-Learning and SARSA algorithms","Train agents using policy gradient methods","Use OpenAI Gym to simulate environments","Build a Deep RL agent that plays games end-to-end"] },
        ai5:  { title:"Generative AI",                 instructor:"Dr. Ian Goodfellow",  duration:"10 Weeks · 50 Hours", rating:"4.9", level:"Intermediate", section:"ai",  image:"https://picsum.photos/seed/ai5/400/220",  topics:"GANs,VAEs,Diffusion Models,Prompt Engineering,LLMs",                                     prereqs:"Neural network fundamentals and Python required.",                    learn:["Build and train Generative Adversarial Networks (GANs)","Implement Variational Autoencoders (VAEs)","Understand diffusion models behind tools like DALL·E","Master prompt engineering for LLMs","Create AI-generated text, images, and code"] },
        ml1:  { title:"ML Fundamentals",               instructor:"Dr. Andrew Ng",       duration:"10 Weeks · 50 Hours", rating:"4.8", level:"Beginner",     section:"ml",  image:"https://picsum.photos/seed/ml1/400/220",  topics:"Supervised Learning,Regression,Classification,Model Evaluation,scikit-learn",            prereqs:"Basic Python and high school mathematics required.",                  learn:["Understand supervised vs unsupervised learning","Build regression and classification models","Evaluate models using cross-validation and metrics","Tune hyperparameters for better performance","Apply scikit-learn to real datasets"] },
        ml2:  { title:"Feature Engineering",           instructor:"Kaggle Team",         duration:"8 Weeks · 40 Hours",  rating:"4.6", level:"Intermediate", section:"ml",  image:"https://picsum.photos/seed/ml2/400/220",  topics:"Data Cleaning,Encoding,Scaling,PCA,Feature Selection",                                   prereqs:"ML Fundamentals and Pandas knowledge required.",                     learn:["Clean messy datasets and handle missing values","Encode categorical variables effectively","Scale and normalize numerical features","Reduce dimensionality using PCA and more","Select the most impactful features for your model"] },
        ml3:  { title:"Deep Learning with TensorFlow", instructor:"Dr. Jeff Dean",       duration:"14 Weeks · 70 Hours", rating:"4.9", level:"Advanced",     section:"ml",  image:"https://picsum.photos/seed/ml3/400/220",  topics:"Neural Networks,CNNs,RNNs,Transfer Learning,TensorFlow 2.x",                            prereqs:"Solid ML background and Python required. Calculus helpful.",          learn:["Design and train deep neural networks with TensorFlow 2.x","Build CNNs for image tasks and RNNs for sequences","Apply transfer learning to save training time","Use Keras for rapid model prototyping","Save, load and serve models for production"] },
        ml4:  { title:"ML Deployment & MLOps",         instructor:"Prof. Chip Huyen",    duration:"10 Weeks · 50 Hours", rating:"4.7", level:"Advanced",     section:"ml",  image:"https://picsum.photos/seed/ml4/400/220",  topics:"Docker,FastAPI,CI/CD for ML,Monitoring,MLflow",                                          prereqs:"ML experience and basic Linux/command-line skills required.",         learn:["Package ML models into Docker containers","Build REST APIs for model serving with FastAPI","Set up CI/CD pipelines for automated retraining","Monitor live models for drift and degradation","Use MLflow for experiment tracking and versioning"] },
        ds1:  { title:"Python for Data Science",       instructor:"Dr. Wes McKinney",    duration:"8 Weeks · 40 Hours",  rating:"4.8", level:"Beginner",     section:"ds",  image:"https://picsum.photos/seed/ds1/400/220",  topics:"NumPy,Pandas,Matplotlib,Seaborn,Data Wrangling",                                         prereqs:"Basic Python programming. No data science experience needed.",        learn:["Manipulate datasets efficiently with Pandas","Perform numerical computing with NumPy","Visualize data with Matplotlib and Seaborn","Clean and wrangle messy real-world data","Derive actionable insights from raw datasets"] },
        ds2:  { title:"Data Visualization",            instructor:"Prof. Edward Tufte",  duration:"6 Weeks · 30 Hours",  rating:"4.7", level:"Intermediate", section:"ds",  image:"https://picsum.photos/seed/ds2/400/220",  topics:"Tableau,Power BI,Plotly,Dashboards,Storytelling",                                        prereqs:"Basic data analysis skills and familiarity with spreadsheets.",       learn:["Create interactive dashboards using Plotly and Tableau","Tell compelling data stories for business audiences","Choose the right chart type for every dataset","Design Power BI reports from scratch","Publish and share live dashboards online"] },
        ds3:  { title:"Statistics for Data Science",   instructor:"Dr. John Ioannidis",  duration:"8 Weeks · 40 Hours",  rating:"4.6", level:"Beginner",     section:"ds",  image:"https://picsum.photos/seed/ds3/400/220",  topics:"Probability,Hypothesis Testing,Distributions,Bayesian Thinking,statsmodels",            prereqs:"High school math. Basic Python is a plus.",                           learn:["Understand probability theory and distributions","Conduct and interpret hypothesis tests","Apply Bayesian thinking to real problems","Use statistical tools in Python (scipy, statsmodels)","Avoid common statistical errors and biases"] },
        ds4:  { title:"Big Data with Spark",           instructor:"Prof. Matei Zaharia", duration:"12 Weeks · 60 Hours", rating:"4.8", level:"Advanced",     section:"ds",  image:"https://picsum.photos/seed/ds4/400/220",  topics:"Hadoop,PySpark,Spark SQL,Streaming,Cluster Computing",                                   prereqs:"Python and SQL proficiency. Linux basics helpful.",                   learn:["Set up and navigate Hadoop distributed file system","Write PySpark jobs to process terabyte-scale data","Query big data with Spark SQL","Build real-time streaming pipelines","Optimize cluster performance for production workloads"] },
        nlp1: { title:"NLP Foundations",               instructor:"Dr. Dan Jurafsky",    duration:"8 Weeks · 40 Hours",  rating:"4.7", level:"Beginner",     section:"nlp", image:"https://picsum.photos/seed/nlp1/400/220", topics:"Tokenization,POS Tagging,NER,NLTK,spaCy",                                                prereqs:"Python basics required. No linguistics background needed.",           learn:["Tokenize and preprocess raw text data","Perform POS tagging and dependency parsing","Extract named entities from documents","Use NLTK and spaCy for text processing pipelines","Build a basic text classification model"] },
        nlp2: { title:"Transformers & BERT",           instructor:"Dr. Jacob Devlin",    duration:"12 Weeks · 60 Hours", rating:"4.9", level:"Advanced",     section:"nlp", image:"https://picsum.photos/seed/nlp2/400/220", topics:"Attention Mechanism,BERT,GPT,Fine-tuning,Hugging Face",                                  prereqs:"Deep learning and NLP fundamentals required.",                       learn:["Understand self-attention and transformer architecture","Fine-tune BERT for classification and QA tasks","Work with GPT models for text generation","Use Hugging Face Transformers library end-to-end","Deploy a transformer model as a REST API"] },
        nlp3: { title:"Sentiment Analysis",            instructor:"Prof. Bing Liu",      duration:"8 Weeks · 40 Hours",  rating:"4.6", level:"Intermediate", section:"nlp", image:"https://picsum.photos/seed/nlp3/400/220", topics:"Lexicon Methods,VADER,Deep Learning for Sentiment,Opinion Mining",                        prereqs:"NLP Foundations and basic ML knowledge required.",                   learn:["Classify text as positive, negative, or neutral","Use lexicon-based and ML-based approaches","Analyze product reviews and social media data","Build aspect-level sentiment classifiers","Visualize sentiment trends over time"] },
        nlp4: { title:"Chatbot Development",           instructor:"Rasa Team",           duration:"10 Weeks · 50 Hours", rating:"4.8", level:"Intermediate", section:"nlp", image:"https://picsum.photos/seed/nlp4/400/220", topics:"Intent Classification,Dialogue Management,Rasa,LangChain,APIs",                         prereqs:"NLP basics and Python required. REST API knowledge helpful.",         learn:["Design conversational flows and dialogue systems","Train intent classifiers and entity extractors","Build a working chatbot with Rasa Open Source","Integrate chatbots with APIs and external services","Deploy your chatbot to web and messaging platforms"] },
    };

    // Merge in any courses added via the Add Course form so they're editable too
    const addedCourses = JSON.parse(localStorage.getItem("newCourses") || "[]");
    addedCourses.forEach(c => {
        COURSES[c.id] = {
            title:      c.title,
            instructor: c.instructor,
            duration:   c.duration,
            rating:     c.rating,
            level:      c.level,
            section:    c.section,
            image:      c.image,
            topics:     c.topics,
            prereqs:    c.prereqs || "",
            learn:      c.outcome ? [c.outcome] : []
        };
    });

    // ===================== LOAD COURSE INTO FORM =====================
    const params   = new URLSearchParams(window.location.search);
    const courseId = params.get("course") || "";
    const course   = COURSES[courseId];

    if (course) {
        document.getElementById("ecPageTitle").textContent    = "Edit: " + course.title;
        document.getElementById("ecPageSubtitle").textContent = "Course ID: " + courseId.toUpperCase();
        document.getElementById("ecTitle").value              = course.title;
        document.getElementById("ecInstructor").value         = course.instructor;
        document.getElementById("ecDuration").value           = course.duration;
        document.getElementById("ecRating").value             = course.rating;
        document.getElementById("ecTopics").value             = course.topics;
        document.getElementById("ecPrereqs").value            = course.prereqs;
        document.getElementById("ecImage").value              = course.image;
        document.getElementById("ecImgPreview").src           = course.image;
        document.getElementById("ecImgPreview").style.display = "block";
        document.getElementById("ecImgPlaceholder").style.display = "none";

        // Set level dropdown
        const lvlSel = document.getElementById("ecLevel");
        for (let o of lvlSel.options) { if (o.value === course.level) o.selected = true; }

        // Set section dropdown
        const secSel = document.getElementById("ecSection");
        for (let o of secSel.options) { if (o.value === course.section) o.selected = true; }

        // Populate learn items
        course.learn.forEach(item => addLearnItem(item));

        // Show delete button only when editing an existing course
        document.getElementById("ecDeleteBtn").hidden = false;
    } else {
        // No course — blank form for adding new
        document.getElementById("ecPageTitle").textContent    = "Add New Course";
        document.getElementById("ecPageSubtitle").textContent = "Fill in the details below.";
        addLearnItem();
    }

    // ===================== LEARN ITEMS =====================
    window.addLearnItem = addLearnItem;

    function addLearnItem(value = "") {
        const list = document.getElementById("ecLearnList");
        const row  = document.createElement("div");
        row.className = "ec-learn-row";
        row.innerHTML = `
            <input type="text" placeholder="e.g. Build a neural network from scratch" value="${value}">
            <button type="button" class="ec-remove-btn" onclick="this.parentElement.remove()">
                <i class="fa-solid fa-trash"></i>
            </button>`;
        list.appendChild(row);
    }

    // ===================== IMAGE PREVIEW =====================
    document.getElementById("ecImage").addEventListener("input", function() {
        const preview     = document.getElementById("ecImgPreview");
        const placeholder = document.getElementById("ecImgPlaceholder");
        if (this.value) {
            preview.src           = this.value;
            preview.style.display = "block";
            placeholder.style.display = "none";
        } else {
            preview.style.display     = "none";
            placeholder.style.display = "flex";
        }
    });

    // ===================== FORM SUBMIT =====================
    document.getElementById("editCourseForm").addEventListener("submit", function(e) {
        e.preventDefault();

        const learnItems = [...document.querySelectorAll(".ec-learn-row input")]
                            .map(i => i.value.trim()).filter(Boolean);

        const updated = {
            title:      document.getElementById("ecTitle").value.trim(),
            instructor: document.getElementById("ecInstructor").value.trim(),
            duration:   document.getElementById("ecDuration").value.trim(),
            rating:     document.getElementById("ecRating").value.trim(),
            level:      document.getElementById("ecLevel").value,
            section:    document.getElementById("ecSection").value,
            image:      document.getElementById("ecImage").value.trim(),
            topics:     document.getElementById("ecTopics").value.trim(),
            prereqs:    document.getElementById("ecPrereqs").value.trim(),
            learn:      learnItems
        };

        // Save to localStorage so courses.html can read it
        if (courseId) {
            localStorage.setItem("course_" + courseId, JSON.stringify(updated));
        }

        alert("Changes saved successfully!\n\nCourse: " + updated.title);
        window.location.href = "courses.html";
    });

    // ===================== DELETE COURSE =====================
    document.getElementById("ecDeleteBtn").addEventListener("click", function() {
        if (!courseId) return;

        const courseTitle = document.getElementById("ecTitle").value.trim() || courseId.toUpperCase();
        const confirmed = confirm("Are you sure you want to delete \"" + courseTitle + "\"?\n\nThis action cannot be undone.");
        if (!confirmed) return;

        // Track deleted course IDs so courses.html can hide them
        const deleted = JSON.parse(localStorage.getItem("deletedCourses") || "[]");
        if (!deleted.includes(courseId)) {
            deleted.push(courseId);
            localStorage.setItem("deletedCourses", JSON.stringify(deleted));
        }

        // Clean up any saved edits for this course since it's being removed
        localStorage.removeItem("course_" + courseId);

        // If this was an admin-added course, remove it from that list too
        const remainingNew = addedCourses.filter(c => c.id !== courseId);
        localStorage.setItem("newCourses", JSON.stringify(remainingNew));

        alert("Course deleted successfully.");
        window.location.href = "courses.html";
    });
    
}

/* =========================================================================
   DISPATCH
   Runs the matching initializer for the current page, based on
   <body data-page="..."> — the only thing each HTML file needs to set.
========================================================================= */

(function(){
    const PAGE_INITIALIZERS = {
        "stu-dashboard":     initStuDashboard,
        "notifications":     initNotifications,
        "certificate":       initCertificate,
        "courses":           initCourses,
        "course":            initCoursePage,
        "admin-dashboard":   initAdminDashboard,
        "admin-login":       initAdminLogin,
        "add-course-edit":   initAddCourseEdit,
        "edit-course-login": initEditCourseLogin,
        "add-course":        initAddCourse,
        "edit-course":       initEditCourse
    };

    const page = document.body.getAttribute("data-page");
    const run  = PAGE_INITIALIZERS[page];
    if (!run) return;

    if (document.readyState === "loading"){
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }
})();