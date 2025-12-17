// ===================================
// Professional AI Diagnostic Chatbot
// Image Analysis & Disease Detection
// ===================================

class DiagnosticChatbot {
    constructor() {
        // DOM Elements
        this.messagesContainer = document.getElementById('messagesContainer');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.clearModal = document.getElementById('clearModal');

        // Image upload elements
        this.imageInput = document.getElementById('imageInput');
        this.attachBtn = document.getElementById('attachBtn');
        this.imageUploadSection = document.getElementById('imageUploadSection');
        this.imagePreview = document.getElementById('imagePreview');
        this.previewImg = document.getElementById('previewImg');
        this.removeImageBtn = document.getElementById('removeImageBtn');

        // Settings
        this.settings = this.loadSettings();

        // Conversation State
        this.conversationHistory = [];
        this.selectedImage = null;
        this.currentLanguage = 'fr'; // Track current language

        // Natural language responses
        this.greetings = {
            'bonjour': 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?',
            'salut': 'Salut ! 😊 Que puis-je faire pour vous ?',
            'hello': 'Hello ! Comment allez-vous ?',
            'coucou': 'Coucou ! Je suis là pour vous aider !',
            'hey': 'Hey ! Prêt à analyser vos plantes ?',
            'bonsoir': 'Bonsoir ! 🌙 Comment puis-je vous aider ce soir ?',
            'hi': 'Hi ! Je suis votre assistant de diagnostic 🌱'
        };

        this.thanks = {
            'merci': 'Avec plaisir ! N\'hésitez pas si vous avez d\'autres questions 😊',
            'thank': 'You\'re welcome ! Anything else I can help with?',
            'thanks': 'De rien ! Je suis là pour vous aider 🌱',
            'merci beaucoup': 'Très heureux de pouvoir vous aider ! 💚',
            'merci bien': 'C\'est un plaisir ! N\'hésitez pas pour d\'autres analyses 📸',
            'super': 'Content de vous aider ! 😊',
            'parfait': 'Excellent ! Autre chose ? 🌿',
            'génial': 'Ravi que ça vous plaise ! 🎉'
        };

        this.farewells = {
            'au revoir': 'Au revoir ! À bientôt pour de nouvelles analyses 👋',
            'bye': 'Bye ! Prenez soin de vos plantes 🌱',
            'adieu': 'À bientôt ! Bonne journée 😊',
            'salut': 'À plus tard ! 👋',
            'ciao': 'Ciao ! Revenez quand vous voulez 🍃'
        };

        this.help = {
            'aide': 'Je peux vous aider à :\n• 📸 Analyser une photo de votre plante\n• 🔍 Détecter les maladies des tomates\n• 💡 Donner des recommandations\n• ℹ️ Expliquer les maladies supportées',
            'help': 'Je peux vous aider à :\n• 📸 Analyser une photo de votre plante\n• 🔍 Détecter les maladies des tomates\n• 💡 Donner des recommandations\n• ℹ️ Expliquer les maladies supportées',
            'comment': 'C\'est simple ! Envoyez-moi une photo de votre plant de tomate et je vous donnerai un diagnostic précis avec des recommandations. Vous pouvez cliquer sur le bouton caméra 📷 ou sur "Analyser une image".',
            'quoi': 'Je suis un assistant IA spécialisé dans la détection des maladies des plantes de tomate. J\'utilise l\'intelligence artificielle pour analyser vos photos et vous donner un diagnostic rapide ! 🤖',
            'qui': 'Je suis un assistant IA intelligent conçu pour vous aider à diagnostiquer les maladies de vos plants de tomates 🍅',
            'pourquoi': 'Je suis là pour vous aider à protéger vos plantes ! En détectant les maladies tôt, vous pouvez les traiter efficacement 🌱',
            'capable': 'Je peux analyser des photos de plants de tomates et détecter 10 types de maladies différentes avec une grande précision ! 🎯',
            'fonctionner': 'J\'utilise un réseau de neurones entraîné sur des milliers d\'images de plantes pour reconnaître les maladies. Envoyez une photo et je l\'analyse ! 🧠'
        };

        this.status = {
            'ça va': 'Je vais très bien, merci ! Prêt à analyser vos plantes 😊',
            'comment vas': 'Je fonctionne parfaitement ! Comment puis-je vous aider ? 🌟',
            'comment allez': 'Tout va bien de mon côté ! Et vos plantes ? 🌱',
            'tu vas bien': 'Oui, parfaitement ! Prêt à diagnostiquer vos plantes 🤖',
            'quoi de neuf': 'Toujours prêt à analyser de nouvelles plantes ! Vous en avez une à me montrer ? 📸'
        };

        this.capabilities = {
            'que peux': 'Je peux analyser des photos de plants de tomates et détecter 10 maladies différentes ! Envoyez-moi une image 📸',
            'tu peux': 'Je peux détecter les maladies des tomates, donner des recommandations de traitement et vous conseiller ! 💡',
            'capable de': 'Je suis capable d\'analyser vos photos et de détecter : taches, moisissures, virus, parasites et plus ! 🔍',
            'faire quoi': 'Je détecte les maladies des tomates à partir de photos. Envoyez-moi une image de votre plante ! 🌿'
        };

        this.diseases = {
            'Tomato_healthy': 'Sain',
            'Tomato_bacterial_spot': 'Tache bactérienne',
            'Tomato_early_blight': 'Mildiou précoce',
            'Tomato_late_blight': 'Mildiou tardif',
            'Tomato_leaf_mold': 'Moisissure des feuilles',
            'Tomato_septoria_leaf_spot': 'Tache septorienne',
            'Tomato_spider_mites_two-spotted_spider_mite': 'Acariens',
            'Tomato_target_spot': 'Tache cible',
            'Tomato_mosaic_virus': 'Virus de la mosaïque',
            'Tomato_yellow_leaf_curl_virus': 'Virus de l\'enroulement jaune'
        };

        this.init();
    }

    // Detect language from text
    detectLanguage(text) {
        const arabicPattern = /[\u0600-\u06FF]/;
        const frenchPatterns = ['bonjour', 'merci', 'salut', 'bonsoir', 'au revoir', 'aide', 'comment', 'quoi', 'pourquoi', 'qui'];
        const englishPatterns = ['hello', 'thanks', 'help', 'what', 'how', 'why', 'who', 'bye', 'hi'];

        const lowerText = text.toLowerCase();

        // Check for Arabic characters
        if (arabicPattern.test(text)) {
            return 'ar';
        }

        // Count French and English keywords
        let frenchCount = 0;
        let englishCount = 0;

        frenchPatterns.forEach(pattern => {
            if (lowerText.includes(pattern)) frenchCount++;
        });

        englishPatterns.forEach(pattern => {
            if (lowerText.includes(pattern)) englishCount++;
        });

        // Return detected language or default to French
        if (englishCount > frenchCount) return 'en';
        return 'fr';
    }

    // Get multilingual responses
    getMultilingualResponse(key, lang) {
        const responses = {
            greeting: {
                fr: 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?',
                en: 'Hello! 👋 How can I help you today?',
                ar: 'مرحبا! 👋 كيف يمكنني مساعدتك اليوم؟'
            },
            greeting_evening: {
                fr: 'Bonsoir ! 🌙 Comment puis-je vous aider ce soir ?',
                en: 'Good evening! 🌙 How can I help you tonight?',
                ar: 'مساء الخير! 🌙 كيف يمكنني مساعدتك الليلة؟'
            },
            thanks: {
                fr: 'Avec plaisir ! N\'hésitez pas si vous avez d\'autres questions 😊',
                en: 'You\'re welcome! Feel free to ask if you have any other questions 😊',
                ar: 'على الرحب والسعة! لا تتردد في السؤال إذا كان لديك أي أسئلة أخرى 😊'
            },
            farewell: {
                fr: 'Au revoir ! À bientôt pour de nouvelles analyses 👋',
                en: 'Goodbye! See you soon for new analyses 👋',
                ar: 'وداعا! أراك قريبا لتحليلات جديدة 👋'
            },
            help: {
                fr: 'Je peux vous aider à :\n• 📸 Analyser une photo de votre plante\n• 🔍 Détecter les maladies des tomates\n• 💡 Donner des recommandations\n• ℹ️ Expliquer les maladies supportées',
                en: 'I can help you with:\n• 📸 Analyze a photo of your plant\n• 🔍 Detect tomato diseases\n• 💡 Give recommendations\n• ℹ️ Explain supported diseases',
                ar: 'يمكنني مساعدتك في:\n• 📸 تحليل صورة نباتك\n• 🔍 اكتشاف أمراض الطماطم\n• 💡 تقديم التوصيات\n• ℹ️ شرح الأمراض المدعومة'
            },
            status: {
                fr: 'Je vais très bien, merci ! Prêt à analyser vos plantes 😊',
                en: 'I\'m doing great, thanks! Ready to analyze your plants 😊',
                ar: 'أنا بخير، شكرا! جاهز لتحليل نباتاتك 😊'
            },
            capabilities: {
                fr: 'Je peux analyser des photos de plants de tomates et détecter 10 maladies différentes ! Envoyez-moi une image 📸',
                en: 'I can analyze photos of tomato plants and detect 10 different diseases! Send me an image 📸',
                ar: 'يمكنني تحليل صور نباتات الطماطم واكتشاف 10 أمراض مختلفة! أرسل لي صورة 📸'
            },
            how_it_works: {
                fr: 'C\'est simple ! Envoyez-moi une photo de votre plant de tomate et je vous donnerai un diagnostic précis avec des recommandations. Cliquez sur le bouton caméra 📷',
                en: 'It\'s simple! Send me a photo of your tomato plant and I\'ll give you an accurate diagnosis with recommendations. Click the camera button 📷',
                ar: 'إنه بسيط! أرسل لي صورة نبات الطماطم الخاص بك وسأعطيك تشخيصًا دقيقًا مع التوصيات. انقر على زر الكاميرا 📷'
            },
            who_am_i: {
                fr: 'Je suis un assistant IA intelligent conçu pour vous aider à diagnostiquer les maladies de vos plants de tomates 🍅',
                en: 'I\'m an intelligent AI assistant designed to help you diagnose diseases in your tomato plants 🍅',
                ar: 'أنا مساعد ذكاء اصطناعي مصمم لمساعدتك في تشخيص أمراض نباتات الطماطم 🍅'
            },
            diseases_list: {
                fr: '🌱 Je peux détecter les maladies suivantes :\n\n✅ Sain\n🦠 Tache bactérienne\n🍂 Mildiou précoce\n🍂 Mildiou tardif\n🍄 Moisissure des feuilles\n🔴 Tache septorienne\n🕷️ Acariens\n🎯 Tache cible\n🦠 Virus de la mosaïque\n🟡 Virus de l\'enroulement jaune\n\n📸 Envoyez une photo !',
                en: '🌱 I can detect the following diseases:\n\n✅ Healthy\n🦠 Bacterial spot\n🍂 Early blight\n🍂 Late blight\n🍄 Leaf mold\n🔴 Septoria leaf spot\n🕷️ Spider mites\n🎯 Target spot\n🦠 Mosaic virus\n🟡 Yellow leaf curl virus\n\n📸 Send a photo!',
                ar: '🌱 يمكنني اكتشاف الأمراض التالية:\n\n✅ سليم\n🦠 بقعة بكتيرية\n🍂 لفحة مبكرة\n🍂 لفحة متأخرة\n🍄 عفن الأوراق\n🔴 بقعة سبتوريا\n🕷️ عث العنكبوت\n🎯 بقعة مستهدفة\n🦠 فيروس الموزاييك\n🟡 فيروس تجعد الأوراق الأصفر\n\n📸 أرسل صورة!'
            },
            default: {
                fr: 'Pour mieux vous aider, pourriez-vous m\'envoyer une photo de votre plante ? 📸',
                en: 'To better help you, could you send me a photo of your plant? 📸',
                ar: 'لمساعدتك بشكل أفضل، هل يمكنك إرسال صورة لنباتك؟ 📸'
            }
        };

        return responses[key] ? responses[key][lang] || responses[key]['fr'] : null;
    }

    // Get detailed recommendations
    getDetailedRecommendations(topic, lang) {
        const details = {
            fongicide: {
                fr: '🍄 **Traitement fongicide** :\n\n✅ Produits recommandés :\n• Cuivre (bouillie bordelaise)\n• Soufre mouillable\n• Bicarbonate de sodium\n\n📋 Application :\n• Pulvériser tôt le matin ou en soirée\n• Répéter tous les 10-14 jours\n• Éviter les périodes de pluie\n\n⚠️ Précautions : Respecter les doses indiquées',
                en: '🍄 **Fungicide treatment** :\n\n✅ Recommended products:\n• Copper (Bordeaux mixture)\n• Wettable sulfur\n• Sodium bicarbonate\n\n📋 Application:\n• Spray early morning or evening\n• Repeat every 10-14 days\n• Avoid rainy periods\n\n⚠️ Precautions: Follow recommended dosages',
                ar: '🍄 **العلاج بمبيد الفطريات** :\n\n✅ المنتجات الموصى بها:\n• النحاس (خليط بوردو)\n• الكبريت القابل للبلل\n• بيكربونات الصوديوم\n\n📋 الاستخدام:\n• رش في الصباح الباكر أو المساء\n• كرر كل 10-14 يوماً\n• تجنب فترات المطر\n\n⚠️ احتياطات: اتبع الجرعات الموصى بها'
            },
            circulation: {
                fr: '💨 **Améliorer la circulation d\'air** :\n\n✅ Méthodes :\n• Tailler les feuilles basses\n• Espacer les plants (50-60 cm)\n• Utiliser des tuteurs\n• Aérer la serre régulièrement\n\n📋 Avantages :\n• Réduit l\'humidité\n• Sèche plus vite les feuilles\n• Limite les maladies fongiques',
                en: '💨 **Improve air circulation** :\n\n✅ Methods:\n• Prune lower leaves\n• Space plants (50-60 cm)\n• Use stakes\n• Ventilate greenhouse regularly\n\n📋 Benefits:\n• Reduces humidity\n• Dries leaves faster\n• Limits fungal diseases',
                ar: '💨 **تحسين دوران الهواء** :\n\n✅ الطرق:\n• تقليم الأوراق السفلية\n• التباعد بين النباتات (50-60 سم)\n• استخدام الدعامات\n• تهوية الدفيئة بانتظام\n\n📋 الفوائد:\n• يقلل الرطوبة\n• يجفف الأوراق بشكل أسرع\n• يحد من الأمراض الفطرية'
            },
            arrosage: {
                fr: '💧 **Gestion de l\'arrosage** :\n\n✅ Bonnes pratiques :\n• Arroser au pied (pas les feuilles)\n• Le matin de préférence\n• Eau à température ambiante\n• Sol humide mais pas détrempé\n\n📋 Fréquence :\n• Été : tous les 2-3 jours\n• Printemps/Automne : 2 fois/semaine\n• Adapter selon la météo\n\n⚠️ Éviter l\'excès d\'eau !',
                en: '💧 **Watering management** :\n\n✅ Best practices:\n• Water at base (not leaves)\n• Morning preferred\n• Room temperature water\n• Moist but not soggy soil\n\n📋 Frequency:\n• Summer: every 2-3 days\n• Spring/Fall: twice weekly\n• Adjust for weather\n\n⚠️ Avoid overwatering!',
                ar: '💧 **إدارة الري** :\n\n✅ أفضل الممارسات:\n• الري عند القاعدة (وليس الأوراق)\n• يفضل في الصباح\n• ماء بدرجة حرارة الغرفة\n• تربة رطبة وليست مشبعة\n\n📋 التكرار:\n• الصيف: كل 2-3 أيام\n• الربيع/الخريف: مرتين في الأسبوع\n• التكيف حسب الطقس\n\n⚠️ تجنب الإفراط في الري!'
            },
            taille: {
                fr: '✂️ **Taille et entretien** :\n\n✅ Quand tailler :\n• Feuilles infectées : immédiatement\n• Gourmands : régulièrement\n• Feuilles basses : dès la floraison\n\n📋 Technique :\n• Outils désinfectés (alcool 70°)\n• Coupe nette et franche\n• Jeter les déchets (ne pas composter)\n• Désinfecter entre chaque plant\n\n⚠️ Ne pas tailler par temps humide',
                en: '✂️ **Pruning and maintenance** :\n\n✅ When to prune:\n• Infected leaves: immediately\n• Suckers: regularly\n• Lower leaves: at flowering\n\n📋 Technique:\n• Disinfected tools (70° alcohol)\n• Clean, sharp cut\n• Dispose of waste (don\'t compost)\n• Disinfect between plants\n\n⚠️ Don\'t prune in wet weather',
                ar: '✂️ **التقليم والصيانة** :\n\n✅ متى يتم التقليم:\n• الأوراق المصابة: فوراً\n• البراعم الجانبية: بانتظام\n• الأوراق السفلية: عند الإزهار\n\n📋 التقنية:\n• أدوات معقمة (كحول 70°)\n• قطع نظيف وحاد\n• التخلص من النفايات (لا تستخدم كسماد)\n• التعقيم بين النباتات\n\n⚠️ لا تقلم في الطقس الرطب'
            },
            prevention: {
                fr: '🛡️ **Prévention des maladies** :\n\n✅ Mesures préventives :\n• Rotation des cultures (3-4 ans)\n• Variétés résistantes\n• Paillage du sol\n• Éviter l\'eau sur feuillage\n• Désherbage régulier\n\n📋 Surveillance :\n• Inspection hebdomadaire\n• Agir dès les premiers signes\n• Isoler plants malades\n\n💡 Mieux vaut prévenir que guérir !',
                en: '🛡️ **Disease prevention** :\n\n✅ Preventive measures:\n• Crop rotation (3-4 years)\n• Resistant varieties\n• Soil mulching\n• Avoid water on foliage\n• Regular weeding\n\n📋 Monitoring:\n• Weekly inspection\n• Act at first signs\n• Isolate sick plants\n\n💡 Prevention is better than cure!',
                ar: '🛡️ **الوقاية من الأمراض** :\n\n✅ تدابير وقائية:\n• تناوب المحاصيل (3-4 سنوات)\n• أصناف مقاومة\n• نشارة التربة\n• تجنب الماء على الأوراق\n• إزالة الأعشاب بانتظام\n\n📋 المراقبة:\n• فحص أسبوعي\n• التصرف عند أول علامة\n• عزل النباتات المريضة\n\n💡 الوقاية خير من العلاج!'
            }
        };

        return details[topic] ? details[topic][lang] : null;
    }

    init() {
        this.loadConversationHistory();
        this.populateSettings();
        this.attachEventListeners();

        // Send welcome message if no history
        if (this.conversationHistory.length === 0) {
            setTimeout(() => {
                let welcomeMsg = 'Bonjour ! 👋 Je suis votre assistant IA pour la détection des maladies des plantes.\n\n📸 Envoyez-moi une photo de votre plant de tomate et je vous donnerai un diagnostic précis avec des recommandations !';

                // Personalize if user has set their ID
                if (this.settings.userId) {
                    welcomeMsg = `Bonjour ${this.settings.userId} ! 👋 Je suis votre assistant IA pour la détection des maladies des plantes.\n\n📸 Envoyez-moi une photo de votre plant de tomate et je vous donnerai un diagnostic précis avec des recommandations !`;
                }

                this.sendBotMessage(welcomeMsg);
            }, 1000);
        }
    }

    attachEventListeners() {
        // Send message
        this.sendBtn.addEventListener('click', () => this.handleSendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSendMessage();
        });

        // Image upload
        this.attachBtn.addEventListener('click', () => this.imageInput.click());
        this.imageInput.addEventListener('change', (e) => this.handleImageSelect(e));
        this.removeImageBtn.addEventListener('click', () => this.removeImage());

        // Quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e.target.closest('.quick-action-btn').dataset.action));
        });

        // Settings modal
        this.settingsBtn.addEventListener('click', () => this.openModal('settingsModal'));
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal('settingsModal'));
        document.getElementById('cancelSettings').addEventListener('click', () => this.closeModal('settingsModal'));
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());

        // Clear conversation modal
        this.clearBtn.addEventListener('click', () => this.openModal('clearModal'));
        document.getElementById('cancelClear').addEventListener('click', () => this.closeModal('clearModal'));
        document.getElementById('confirmClear').addEventListener('click', () => this.clearConversation());

        // Close modal on overlay click
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Theme selector
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.theme-btn').classList.add('active');
            });
        });
    }

    handleImageSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image valide');
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            alert('L\'image est trop grande (max 10MB)');
            return;
        }

        this.selectedImage = file;

        // Preview image
        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewImg.src = e.target.result;
            this.imageUploadSection.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        this.selectedImage = null;
        this.imageInput.value = '';
        this.imageUploadSection.classList.add('hidden');
        this.previewImg.src = '';
    }

    async handleSendMessage() {
        const message = this.userInput.value.trim();

        // If there's an image, analyze it
        if (this.selectedImage) {
            this.userInput.value = ''; // Clear input field
            await this.analyzeImage();
            return;
        }

        // If no message and no image, ignore
        if (!message) return;

        // Display user message
        this.addMessage(message, 'user');
        this.userInput.value = '';

        // Process message
        this.processUserMessage(message);
    }

    async analyzeImage() {
        if (!this.selectedImage) return;

        // Display the image in the chat
        const imageUrl = this.previewImg.src;
        const imageMessage = `<div style="max-width: 300px; border-radius: var(--radius-md); overflow: hidden; border: 2px solid var(--primary-color);"><img src="${imageUrl}" style="width: 100%; height: auto; display: block;" alt="Image envoyée"></div>`;
        this.addMessage(imageMessage, 'user', true);

        // Show typing indicator
        this.showTyping();

        try {
            // Prepare form data
            const formData = new FormData();
            formData.append('image', this.selectedImage);
            formData.append('capteurId', 'chatbot-001'); // Default sensor ID
            formData.append('userId', this.settings.userId || 'user-chatbot');

            // Call AI API
            const response = await fetch(`${this.settings.apiUrl}/predict`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }

            const result = await response.json();

            // Hide typing
            this.hideTyping();

            // Display results
            this.displayAnalysisResult(result);

            // Remove image preview
            this.removeImage();

        } catch (error) {
            this.hideTyping();
            this.sendBotMessage(`❌ Erreur lors de l'analyse : ${error.message}\n\nVeuillez vérifier que l'URL de l'API est correcte dans les paramètres.`);
            console.error('Analysis error:', error);
        }
    }

    displayAnalysisResult(result) {
        const lang = this.currentLanguage;

        // Translate disease names
        const diseaseTranslations = {
            'Tomato_healthy': {
                fr: 'Sain',
                en: 'Healthy',
                ar: 'سليم'
            },
            'Tomato_bacterial_spot': {
                fr: 'Tache bactérienne',
                en: 'Bacterial spot',
                ar: 'بقعة بكتيرية'
            },
            'Tomato_early_blight': {
                fr: 'Mildiou précoce',
                en: 'Early blight',
                ar: 'لفحة مبكرة'
            },
            'Tomato_late_blight': {
                fr: 'Mildiou tardif',
                en: 'Late blight',
                ar: 'لفحة متأخرة'
            },
            'Tomato_leaf_mold': {
                fr: 'Moisissure des feuilles',
                en: 'Leaf mold',
                ar: 'عفن الأوراق'
            },
            'Tomato_septoria_leaf_spot': {
                fr: 'Tache septorienne',
                en: 'Septoria leaf spot',
                ar: 'بقعة سبتوريا'
            },
            'Tomato_spider_mites_two-spotted_spider_mite': {
                fr: 'Acariens',
                en: 'Spider mites',
                ar: 'عث العنكبوت'
            },
            'Tomato_target_spot': {
                fr: 'Tache cible',
                en: 'Target spot',
                ar: 'بقعة مستهدفة'
            },
            'Tomato_mosaic_virus': {
                fr: 'Virus de la mosaïque',
                en: 'Mosaic virus',
                ar: 'فيروس الموزاييك'
            },
            'Tomato_yellow_leaf_curl_virus': {
                fr: 'Virus de l\'enroulement jaune',
                en: 'Yellow leaf curl virus',
                ar: 'فيروس تجعد الأوراق الأصفر'
            }
        };

        // Translate labels
        const labels = {
            diagnostic: { fr: 'Diagnostic :', en: 'Diagnosis:', ar: 'التشخيص:' },
            confidence: { fr: 'Confiance :', en: 'Confidence:', ar: 'الثقة:' },
            recommendations: { fr: 'Recommandations :', en: 'Recommendations:', ar: 'التوصيات:' },
            watering: { fr: 'Arrosage recommandé', en: 'Watering recommended', ar: 'ينصح بالري' },
            resultHeader: { fr: 'Résultat du diagnostic', en: 'Diagnosis result', ar: 'نتيجة التشخيص' }
        };

        const diseaseName = diseaseTranslations[result.prediction]
            ? diseaseTranslations[result.prediction][lang]
            : result.prediction;
        const confidence = (result.confidence * 100).toFixed(1);
        const isHealthy = result.prediction === 'Tomato_healthy';

        let message = `<div class="analysis-result">`;
        message += `<div class="result-header">`;
        message += isHealthy ? `✅ ${labels.resultHeader[lang]}` : `⚠️ ${labels.resultHeader[lang]}`;
        message += `</div>`;

        message += `<div class="result-label">${labels.diagnostic[lang]}</div>`;
        message += `<div class="result-value ${isHealthy ? 'healthy' : (result.severity === 'high' ? 'danger' : 'warning')}">${diseaseName}</div>`;

        message += `<div class="result-label" style="margin-top: 1rem;">${labels.confidence[lang]}</div>`;
        message += `<div class="result-value">${confidence}%</div>`;
        message += `<div class="confidence-bar"><div class="confidence-fill" style="width: ${confidence}%"></div></div>`;

        if (result.recommendations && result.recommendations.length > 0) {
            message += `<div class="result-label" style="margin-top: 1rem;">${labels.recommendations[lang]}</div>`;
            message += `<ul class="recommendations-list">`;
            result.recommendations.forEach(rec => {
                // Translate recommendation if needed (basic translation)
                let translatedRec = rec;
                if (lang === 'en') {
                    translatedRec = this.translateRecommendation(rec, 'en');
                } else if (lang === 'ar') {
                    translatedRec = this.translateRecommendation(rec, 'ar');
                }
                message += `<li>${translatedRec}</li>`;
            });
            message += `</ul>`;
        }

        if (result.shouldWater) {
            message += `<div style="margin-top: 1rem; color: var(--info);">💧 ${labels.watering[lang]}</div>`;
        }

        message += `</div>`;

        this.addMessage(message, 'bot', true);

        // Save to conversation history
        this.conversationHistory.push({
            role: 'bot',
            content: `Analyse effectuée: ${diseaseName} (${confidence}% confiance)`,
            timestamp: new Date().toISOString()
        });
        this.saveConversationHistory();
    }

    translateRecommendation(text, toLang) {
        // Basic translation map for common recommendations
        const translations = {
            en: {
                'Retirer les feuilles touchées': 'Remove affected leaves',
                'Traiter avec fongicide': 'Treat with fungicide',
                'Améliorer la circulation d\'air': 'Improve air circulation',
                'Réduire l\'arrosage': 'Reduce watering',
                'Augmenter l\'arrosage': 'Increase watering',
                'Appliquer un traitement préventif': 'Apply preventative treatment',
                'Surveiller l\'évolution': 'Monitor progression',
                'Éliminer les plants infectés': 'Remove infected plants',
                'Désinfecter les outils': 'Disinfect tools',
                'Espacer les plants': 'Space out plants'
            },
            ar: {
                'Retirer les feuilles touchées': 'إزالة الأوراق المصابة',
                'Traiter avec fongicide': 'العلاج بمبيد الفطريات',
                'Améliorer la circulation d\'air': 'تحسين دوران الهواء',
                'Réduire l\'arrosage': 'تقليل الري',
                'Augmenter l\'arrosage': 'زيادة الري',
                'Appliquer un traitement préventif': 'تطبيق العلاج الوقائي',
                'Surveiller l\'évolution': 'مراقبة التطور',
                'Éliminer les plants infectés': 'إزالة النباتات المصابة',
                'Désinfecter les outils': 'تعقيم الأدوات',
                'Espacer les plants': 'التباعد بين النباتات'
            }
        };

        // Try to find translation
        if (translations[toLang] && translations[toLang][text]) {
            return translations[toLang][text];
        }

        // Return original if no translation found
        return text;
    }

    processUserMessage(message) {
        const lowerMessage = message.toLowerCase();

        // Detect language
        const detectedLang = this.detectLanguage(message);

        // Save message to history
        this.conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });
        this.saveConversationHistory();

        // Show typing indicator
        this.showTyping();

        setTimeout(() => {
            let response = null;

            // Check for greetings
            if (lowerMessage.includes('bonjour') || lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('مرحبا') || lowerMessage.includes('السلام')) {
                response = this.getMultilingualResponse('greeting', detectedLang);

                // Personalize with username if available
                if (this.settings.userId) {
                    const personalGreetings = {
                        fr: `Bonjour ${this.settings.userId} ! 👋 Comment puis-je vous aider aujourd'hui ?`,
                        en: `Hello ${this.settings.userId}! 👋 How can I help you today?`,
                        ar: `مرحبا ${this.settings.userId}! 👋 كيف يمكنني مساعدتك اليوم؟`
                    };
                    response = personalGreetings[detectedLang] || personalGreetings['fr'];
                }
            }

            // Check for evening greeting
            if (!response && (lowerMessage.includes('bonsoir') || lowerMessage.includes('good evening') || lowerMessage.includes('مساء'))) {
                response = this.getMultilingualResponse('greeting_evening', detectedLang);

                // Personalize with username if available
                if (this.settings.userId) {
                    const personalEveningGreetings = {
                        fr: `Bonsoir ${this.settings.userId} ! 🌙 Comment puis-je vous aider ce soir ?`,
                        en: `Good evening ${this.settings.userId}! 🌙 How can I help you tonight?`,
                        ar: `مساء الخير ${this.settings.userId}! 🌙 كيف يمكنني مساعدتك الليلة؟`
                    };
                    response = personalEveningGreetings[detectedLang] || personalEveningGreetings['fr'];
                }
            }

            // Check for farewells
            if (!response && (lowerMessage.includes('revoir') || lowerMessage.includes('bye') || lowerMessage.includes('adieu') || lowerMessage.includes('وداع') || lowerMessage.includes('مع السلامة'))) {
                response = this.getMultilingualResponse('farewell', detectedLang);

                // Personalize with username if available
                if (this.settings.userId) {
                    const personalFarewells = {
                        fr: `Au revoir ${this.settings.userId} ! À bientôt pour de nouvelles analyses 👋`,
                        en: `Goodbye ${this.settings.userId}! See you soon for new analyses 👋`,
                        ar: `وداعا ${this.settings.userId}! أراك قريبا لتحليلات جديدة 👋`
                    };
                    response = personalFarewells[detectedLang] || personalFarewells['fr'];
                }
            }

            // Check for status questions
            if (!response && (lowerMessage.includes('ça va') || lowerMessage.includes('comment vas') || lowerMessage.includes('comment allez') || lowerMessage.includes('how are') || lowerMessage.includes('كيف حالك'))) {
                response = this.getMultilingualResponse('status', detectedLang);
            }

            // Check for capabilities questions
            if (!response && (lowerMessage.includes('que peux') || lowerMessage.includes('tu peux') || lowerMessage.includes('capable') || lowerMessage.includes('what can') || lowerMessage.includes('can you') || lowerMessage.includes('ماذا يمكنك') || lowerMessage.includes('هل يمكنك'))) {
                response = this.getMultilingualResponse('capabilities', detectedLang);
            }

            // Check for thanks
            if (!response && (lowerMessage.includes('merci') || lowerMessage.includes('thank') || lowerMessage.includes('شكرا') || lowerMessage.includes('super') || lowerMessage.includes('parfait') || lowerMessage.includes('génial'))) {
                response = this.getMultilingualResponse('thanks', detectedLang);
            }

            // Check for help
            if (!response && (lowerMessage.includes('aide') || lowerMessage.includes('help') || lowerMessage.includes('مساعدة'))) {
                response = this.getMultilingualResponse('help', detectedLang);
            }

            // Check for who am I
            if (!response && (lowerMessage.includes('qui') || lowerMessage.includes('who are') || lowerMessage.includes('من أنت'))) {
                response = this.getMultilingualResponse('who_am_i', detectedLang);
            }

            // Check for how it works
            if (!response && (lowerMessage.includes('comment') || lowerMessage.includes('how') || lowerMessage.includes('كيف'))) {
                response = this.getMultilingualResponse('how_it_works', detectedLang);
            }

            // Check for disease information
            if (!response && (lowerMessage.includes('maladie') || lowerMessage.includes('disease') || lowerMessage.includes('supporte') || lowerMessage.includes('أمراض') || lowerMessage.includes('مرض'))) {
                response = this.getMultilingualResponse('diseases_list', detectedLang);
            }

            // Check for image/photo request
            if (!response && (lowerMessage.includes('image') || lowerMessage.includes('photo') || lowerMessage.includes('analyser') || lowerMessage.includes('analyze') || lowerMessage.includes('صورة') || lowerMessage.includes('تحليل'))) {
                const photoInstructions = {
                    fr: '📸 Pour analyser votre plante, cliquez sur le bouton caméra 📷 en bas à gauche pour sélectionner une photo, puis cliquez sur le bouton d\'envoi ➤\n\nAssurez-vous que la photo est claire et montre bien les feuilles !',
                    en: '📸 To analyze your plant, click the camera button 📷 at the bottom left to select a photo, then click the send button ➤\n\nMake sure the photo is clear and shows the leaves well!',
                    ar: '📸 لتحليل نباتك، انقر على زر الكاميرا 📷 في الأسفل واختر صورة، ثم انقر على زر الإرسال ➤\n\nتأكد من أن الصورة واضحة وتظهر الأوراق بشكل جيد!'
                };
                response = photoInstructions[detectedLang];
            }

            // Check for detailed recommendations
            if (!response && (lowerMessage.includes('détail') || lowerMessage.includes('detail') || lowerMessage.includes('تفاصيل') ||
                lowerMessage.includes('expliquer') || lowerMessage.includes('explain') || lowerMessage.includes('شرح') ||
                lowerMessage.includes('comment') || lowerMessage.includes('how') || lowerMessage.includes('كيف'))) {

                // Check which topic they're asking about
                if (lowerMessage.includes('fongicide') || lowerMessage.includes('fungicide') || lowerMessage.includes('الفطريات')) {
                    response = this.getDetailedRecommendations('fongicide', detectedLang);
                } else if (lowerMessage.includes('circulation') || lowerMessage.includes('air') || lowerMessage.includes('الهواء')) {
                    response = this.getDetailedRecommendations('circulation', detectedLang);
                } else if (lowerMessage.includes('arrosage') || lowerMessage.includes('arroser') || lowerMessage.includes('water') || lowerMessage.includes('الري')) {
                    response = this.getDetailedRecommendations('arrosage', detectedLang);
                } else if (lowerMessage.includes('taill') || lowerMessage.includes('prune') || lowerMessage.includes('couper') || lowerMessage.includes('التقليم')) {
                    response = this.getDetailedRecommendations('taille', detectedLang);
                } else if (lowerMessage.includes('prévention') || lowerMessage.includes('prévenir') || lowerMessage.includes('prevent') || lowerMessage.includes('الوقاية')) {
                    response = this.getDetailedRecommendations('prevention', detectedLang);
                } else {
                    // General explanation menu
                    const menu = {
                        fr: '💡 **Je peux vous expliquer en détail** :\n\n1️⃣ Traitement fongicide\n2️⃣ Améliorer la circulation d\'air\n3️⃣ Gestion de l\'arrosage\n4️⃣ Taille et entretien\n5️⃣ Prévention des maladies\n\n📝 Posez votre question ou choisissez un sujet !',
                        en: '💡 **I can explain in detail** :\n\n1️⃣ Fungicide treatment\n2️⃣ Improve air circulation\n3️⃣ Watering management\n4️⃣ Pruning and maintenance\n5️⃣ Disease prevention\n\n📝 Ask your question or choose a topic!',
                        ar: '💡 **يمكنني الشرح بالتفصيل** :\n\n1️⃣ العلاج بمبيد الفطريات\n2️⃣ تحسين دوران الهواء\n3️⃣ إدارة الري\n4️⃣ التقليم والصيانة\n5️⃣ الوقاية من الأمراض\n\n📝 اطرح سؤالك أو اختر موضوعاً!'
                    };
                    response = menu[detectedLang];
                }
            }

            // Default response
            if (!response) {
                response = this.getMultilingualResponse('default', detectedLang);
            }

            this.hideTyping();
            this.sendBotMessage(response);
        }, 800 + Math.random() * 700);
    }

    handleQuickAction(action) {
        const messages = {
            'help': 'Je peux vous aider à :\n• 📸 Analyser une photo de votre plante\n• 🔍 Détecter les maladies des tomates\n• 💡 Donner des recommandations de traitement\n• ℹ️ Expliquer les maladies supportées\n\nEnvoyez-moi une photo pour commencer !',
            'upload': 'Parfait ! Cliquez sur le bouton caméra 📷 en bas à gauche pour sélectionner une photo de votre plant de tomate.\n\nAssurez-vous que la photo est claire et montre bien les feuilles ! 🌱',
            'info': '🌱 Maladies détectables :\n\n✅ Sain\n🦠 Tache bactérienne\n🍂 Mildiou précoce / tardif\n🍄 Moisissure des feuilles\n🔴 Tache septorienne\n🕷️ Acariens\n🎯 Tache cible\n🦠 Virus de la mosaïque\n🟡 Virus de l\'enroulement jaune\n\nL\'IA analyse votre photo et fournit un diagnostic avec des recommandations ! 🤖'
        };

        if (messages[action]) {
            this.showTyping();
            setTimeout(() => {
                this.hideTyping();
                this.sendBotMessage(messages[action]);
            }, 800);
        } else if (action === 'upload') {
            // Trigger image upload
            this.imageInput.click();
        }
    }

    sendBotMessage(message) {
        this.conversationHistory.push({
            role: 'bot',
            content: message,
            timestamp: new Date().toISOString()
        });
        this.saveConversationHistory();
        this.addMessage(message, 'bot');
    }

    addMessage(text, sender, isHTML = false) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${sender}`;

        const avatar = sender === 'bot'
            ? '<i class="fas fa-robot"></i>'
            : '<i class="fas fa-user"></i>';

        const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        const contentHTML = isHTML ? text : this.formatMessage(text);

        messageEl.innerHTML = `
            <div class="message-avatar">
                ${avatar}
            </div>
            <div class="message-bubble">
                <div class="message-text">${contentHTML}</div>
                <span class="message-time">${time}</span>
            </div>
        `;

        this.messagesContainer.appendChild(messageEl);
        this.scrollToBottom();
    }

    formatMessage(text) {
        // Convert newlines to <br>
        text = text.replace(/\n/g, '<br>');

        // Basic emoji support (already in text)
        return text;
    }

    showTyping() {
        this.typingIndicator.classList.remove('hidden');
        this.scrollToBottom();
    }

    hideTyping() {
        this.typingIndicator.classList.add('hidden');
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    // Settings Management
    loadSettings() {
        const defaults = {
            apiUrl: 'http://localhost:5001',
            userId: ''
        };

        const saved = localStorage.getItem('chatbot_settings');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }

    populateSettings() {
        document.getElementById('apiUrl').value = this.settings.apiUrl;
        document.getElementById('userId').value = this.settings.userId;
    }

    saveSettings() {
        const previousUserId = this.settings.userId;

        this.settings = {
            apiUrl: document.getElementById('apiUrl').value,
            userId: document.getElementById('userId').value
        };

        localStorage.setItem('chatbot_settings', JSON.stringify(this.settings));
        this.closeModal('settingsModal');

        // Show confirmation with personalized greeting
        this.showTyping();
        setTimeout(() => {
            this.hideTyping();

            // If user just added their name, greet them personally
            if (this.settings.userId && this.settings.userId !== previousUserId) {
                const greetings = {
                    fr: `✅ Paramètres enregistrés !\n\n👋 Ravi de vous rencontrer, ${this.settings.userId} ! Je suis prêt à analyser vos plantes 🌱`,
                    en: `✅ Settings saved!\n\n👋 Nice to meet you, ${this.settings.userId}! I'm ready to analyze your plants 🌱`,
                    ar: `✅ تم حفظ الإعدادات!\n\n👋 سعيد بلقائك، ${this.settings.userId}! أنا جاهز لتحليل نباتاتك 🌱`
                };
                this.sendBotMessage(greetings[this.currentLanguage] || greetings['fr']);
            } else {
                this.sendBotMessage('✅ Paramètres enregistrés avec succès !');
            }
        }, 500);
    }

    // Conversation History
    loadConversationHistory() {
        const saved = localStorage.getItem('chatbot_history');
        if (saved) {
            this.conversationHistory = JSON.parse(saved);
            this.restoreConversation();
        }
    }

    saveConversationHistory() {
        localStorage.setItem('chatbot_history', JSON.stringify(this.conversationHistory));
    }

    restoreConversation() {
        // Remove welcome message
        const welcome = this.messagesContainer.querySelector('.welcome-message');
        if (welcome) welcome.remove();

        // Restore messages
        this.conversationHistory.forEach(msg => {
            this.addMessage(msg.content, msg.role, msg.content.includes('<div class="analysis-result">'));
        });
    }

    clearConversation() {
        this.conversationHistory = [];
        localStorage.removeItem('chatbot_history');

        // Clear UI
        this.messagesContainer.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-leaf"></i>
                </div>
                <h3>Bienvenue sur l'Assistant IA de Diagnostic</h3>
                <p>Je suis votre assistant intelligent pour détecter les maladies des plantes. Envoyez-moi une photo de votre plant de tomate et je vous donnerai un diagnostic précis avec des recommandations.</p>
            </div>
        `;

        this.closeModal('clearModal');

        // Send welcome message
        setTimeout(() => {
            this.sendBotMessage('Bonjour ! 👋 Prêt à analyser vos plantes ! Envoyez-moi une photo pour commencer.');
        }, 1000);
    }

    // Modal Management
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new DiagnosticChatbot();
    console.log('🤖 Chatbot IA de Diagnostic initialisé');
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiagnosticChatbot;
}
