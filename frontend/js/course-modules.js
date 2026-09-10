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