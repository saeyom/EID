document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const greetingForm = document.getElementById("greetingForm");
    const userNameInput = document.getElementById("userName");
    const generateBtn = document.getElementById("generateBtn");
    
    const inputSection = document.getElementById("inputSection");
    const loadingSection = document.getElementById("loadingSection");
    const resultSection = document.getElementById("resultSection");
    
    const progressBar = document.getElementById("progressBar");
    const previewImage = document.getElementById("previewImage");
    const previewWrapper = document.querySelector(".preview-wrapper");
    
    const downloadBtn = document.getElementById("downloadBtn");
    const editBtn = document.getElementById("editBtn");
    
    const canvas = document.getElementById("greetingCanvas");
    const ctx = canvas.getContext("2d");
    
    // Set Header Logo Src
    const headerLogo = document.getElementById("headerLogo");
    if (headerLogo) {
        if (typeof LOGO_IMAGE_BASE64 !== "undefined") {
            headerLogo.src = LOGO_IMAGE_BASE64;
        } else {
            headerLogo.src = "logo.png";
        }
    }
    
    // Gender Radio and Slider Handling
    const genderSelector = document.querySelector(".gender-selector");
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    
    genderRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "girl") {
                genderSelector.classList.add("girl-selected");
            } else {
                genderSelector.classList.remove("girl-selected");
            }
        });
    });

    // Generate Floating Background Stars
    const starsContainer = document.getElementById("starsContainer");
    const starCount = 35;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement("div");
        star.classList.add("star");
        
        // Random size and positioning
        const size = Math.random() * 3 + 1; // 1px to 4px
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Random opacity and duration
        star.style.setProperty("--opacity", Math.random() * 0.7 + 0.3);
        star.style.setProperty("--duration", `${Math.random() * 4 + 3}s`);
        
        // Random delay
        star.style.animationDelay = `${Math.random() * 5}s`;
        
        starsContainer.appendChild(star);
    }

    // Input Validation
    userNameInput.addEventListener("input", () => {
        const inputGroup = userNameInput.closest(".input-group");
        if (userNameInput.value.trim() !== "") {
            inputGroup.classList.remove("has-error");
        }
    });

    // Form Submission / Generation Trigger
    greetingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const userName = userNameInput.value.trim();
        const inputGroup = userNameInput.closest(".input-group");
        
        if (userName === "") {
            inputGroup.classList.add("has-error");
            userNameInput.focus();
            return;
        }

        const gender = document.querySelector('input[name="gender"]:checked').value;
        
        // Start Generation Pipeline
        startGeneration(userName, gender);
    });

    // Toast Notification System
    function showToast(message, isSuccess = true) {
        const toast = document.getElementById("toast");
        const toastIcon = document.getElementById("toastIcon");
        const toastMessage = document.getElementById("toastMessage");
        
        toastMessage.textContent = message;
        toastIcon.textContent = isSuccess ? "✓" : "⚠";
        toastIcon.style.background = isSuccess ? "var(--color-accent)" : "#ff6b6b";
        
        toast.classList.add("show");
        
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3500);
    }

    // Load Fonts & Generate
    async function startGeneration(name, gender) {
        // 1. Hide Form, Show Loading
        inputSection.classList.add("hidden");
        loadingSection.classList.remove("hidden");
        
        // Reset progress bar
        progressBar.style.width = "0%";
        
        // 2. Animate Progress Bar (Faking heavy drawing pipeline)
        let progress = 0;
        const progressInterval = setInterval(() => {
            if (progress < 90) {
                progress += Math.floor(Math.random() * 15) + 5;
                if (progress > 90) progress = 90;
                progressBar.style.width = `${progress}%`;
            }
        }, 120);

        try {
            // 3. Ensure remote fonts are loaded
            await ensureFontsLoaded();
            
            // 4. Render to Canvas
            await drawGreetingCard(name, gender);
            
            // 5. Complete Progress Bar
            progressBar.style.width = "100%";
            
            // Convert to image URI
            setTimeout(() => {
                try {
                    clearInterval(progressInterval);
                    const dataUrl = canvas.toDataURL("image/png");
                    if (!dataUrl || dataUrl === "data:,") throw new Error("Canvas is empty");
                    
                    previewImage.src = dataUrl;
                    
                    // Hide Loader, Show Result
                    loadingSection.classList.add("hidden");
                    resultSection.classList.remove("hidden");
                    
                    setTimeout(() => {
                        previewWrapper.classList.add("loaded");
                    }, 100);
                    
                    showToast("تم توليد معايدتك الفاخرة بنجاح 💙");
                } catch (err) {
                    console.error("خطأ في تصدير الصورة:", err);
                    clearInterval(progressInterval);
                    loadingSection.classList.add("hidden");
                    inputSection.classList.remove("hidden");
                    
                    if (window.location.protocol === 'file:') {
                        showToast("عذراً، المتصفح يمنع تشغيل التقنية محلياً. يرجى سحب المجلد لبرنامج VS Code وتشغيله عبر Live Server.", false);
                    } else {
                        showToast("فشل تصدير الصورة. تأكد من أن جميع الملفات محملة بشكل صحيح.", false);
                    }
                }
            }, 300);
            
        } catch (error) {
            console.error("Card generation failed", error);
            clearInterval(progressInterval);
            loadingSection.classList.add("hidden");
            inputSection.classList.remove("hidden");
            showToast("حدث خطأ أثناء تحميل الخطوط أو توليد الصورة.", false);
        }
    }

    // Font Loader Verification
    async function ensureFontsLoaded() {
        if (document.fonts) {
            const fontsToLoad = [
                { name: 'Amiri', url: 'https://fonts.gstatic.com/s/amiri/v26/J7aRnpdDnyFm85ra-pg.woff2' },
                { name: 'Cairo', url: 'https://fonts.gstatic.com/s/cairo/v28/SLXJ1O5Obju573DF1K04WbA.woff2' },
                { name: 'Tajawal', url: 'https://fonts.gstatic.com/s/tajawal/v15/I0abDF4CJ1Ea189vX9mHmwI.woff2' },
                { name: 'Alnaseeb', url: './QWxuYXNlZWItUmVndWxhci5vdGYxNjU2NDg4NDM5ODI3' }
            ];

            try {
                for (const font of fontsToLoad) {
                    const f = new FontFace(font.name, `url(${font.url})`);
                    try {
                        const loaded = await f.load();
                        document.fonts.add(loaded);
                    } catch (e) {
                        console.warn(`فشل تحميل الخط ${font.name}:`, e);
                    }
                }
                await document.fonts.ready;
            } catch (error) {
                console.warn("Could not load Google Fonts remotely. Falling back to system fonts.", error);
            }
        } else {
            // Fallback: wait a moment for browser font engine
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    }

    // Canvas Draw Helpers
    function draw8PointedStar(cx, cy, spikes, outerRadius, innerRadius, color) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    function drawCrescent(x, y, radius, color) {
        ctx.beginPath();
        // Outer Moon circle path (clockwise)
        ctx.arc(x, y, radius, 0, Math.PI * 2, true);
        // Inner circle offset path to clip moon (counter-clockwise / offset to make crescent)
        ctx.arc(x - (radius * 0.38), y - (radius * 0.08), radius * 0.88, 0, Math.PI * 2, false);
        ctx.fillStyle = color;
        ctx.fill('evenodd');
    }

    // المحسنة لتدعم الأسطر اليدوية والآلية معا Wrap Arabic text 
    function wrapAndDrawText(text, x, y, maxWidth, lineHeight) {
        // تقسيم النص بناءً على الأسطر الجديدة أولاً
        const paragraphs = text.split("\n");
        let finalLines = [];

        paragraphs.forEach(p => {
            if (p.trim() === "") {
                finalLines.push(""); // حفظ الأسطر الفارغة
                return;
            }
            const words = p.split(" ");
            let line = "";
            for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + " ";
                let testWidth = ctx.measureText(testLine).width;
                if (testWidth > maxWidth && n > 0) {
                    finalLines.push(line);
                    line = words[n] + " ";
                } else {
                    line = testLine;
                }
            }
            finalLines.push(line);
        });

        // Center lines block vertically around Y coordinate
        let currentY = y - ((finalLines.length - 1) * lineHeight) / 2;
        
        for (let i = 0; i < finalLines.length; i++) {
            ctx.fillText(finalLines[i].trim(), x, currentY);
            currentY += lineHeight;
        }
    }

    // Helper to load image
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = src;
        });
    }

    // Canvas API Render Pipeline
    async function drawGreetingCard(name, gender) {
        const w = canvas.width;    // 1080
        const h = canvas.height;   // 1920

        // 1. Clean Canvas
        ctx.clearRect(0, 0, w, h);

        // 2. Try drawing the custom background image
        let bgImg;
        try {
            // الاعتماد المباشر على ملف صورة العيد المضاف للمجلد
            if (typeof BACKGROUND_IMAGE_BASE64 !== "undefined") {
                bgImg = await loadImage(BACKGROUND_IMAGE_BASE64);
            } else {
                bgImg = await loadImage("background.jpg");
            }
        } catch (e) {
            console.warn("Could not load background image, using premium gradient fallback.", e);
        }

        // التحقق من أن الصورة محملة ولها أبعاد صحيحة
        const hasBgImg = bgImg && bgImg.naturalWidth > 0;

        if (hasBgImg) {
            ctx.drawImage(bgImg, 0, 0, w, h);
            
            // إضافة طبقة تدرج ناعمة جداً لضمان وضوح النص مع الحفاظ على تفاصيل الصورة
            const overlayGrad = ctx.createLinearGradient(0, 0, 0, h);
            overlayGrad.addColorStop(0, "rgba(5, 11, 20, 0.3)");   
            overlayGrad.addColorStop(0.4, "rgba(5, 11, 20, 0.05)"); 
            overlayGrad.addColorStop(0.7, "rgba(5, 11, 20, 0.4)"); 
            overlayGrad.addColorStop(1, "rgba(5, 11, 20, 0.7)");    
            ctx.fillStyle = overlayGrad;
            ctx.fillRect(0, 0, w, h);
        } else {
            // Base Dark Gradient Background (Fallback)
            const bgGradient = ctx.createLinearGradient(0, 0, 0, h);
            bgGradient.addColorStop(0, "#050b14");   // Darkest Night
            bgGradient.addColorStop(0.35, "#0a192f"); // Deep Navy
            bgGradient.addColorStop(0.7, "#112240");  // Navy Blue
            bgGradient.addColorStop(1, "#173059");    // Lighter Navy Accent
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, w, h);
        }

        // 3. Ambient Lighting Glow Orbs (Dynamic colors based on background)
        const glowColor1 = hasBgImg ? "rgba(255, 190, 11, 0.06)" : "rgba(100, 223, 223, 0.08)";
        const glowColor2 = hasBgImg ? "rgba(255, 190, 11, 0.02)" : "rgba(48, 102, 190, 0.04)";
        
        // Center glow
        const radialGlow = ctx.createRadialGradient(w/2, h/2 + 100, 50, w/2, h/2 + 100, 700);
        radialGlow.addColorStop(0, glowColor1);
        radialGlow.addColorStop(0.5, glowColor2);
        radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = radialGlow;
        ctx.fillRect(0, 0, w, h);

        // Bottom light orb
        const bottomGlowColor1 = hasBgImg ? "rgba(255, 190, 11, 0.08)" : "rgba(100, 223, 223, 0.12)";
        const bottomGlowColor2 = hasBgImg ? "rgba(255, 190, 11, 0.01)" : "rgba(48, 102, 190, 0.02)";
        
        const bottomGlow = ctx.createRadialGradient(w/2, h, 100, w/2, h, 600);
        bottomGlow.addColorStop(0, bottomGlowColor1);
        bottomGlow.addColorStop(0.7, bottomGlowColor2);
        bottomGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = bottomGlow;
        ctx.fillRect(0, 0, w, h);

        // Top gold moon glow
        const topGlow = ctx.createRadialGradient(w/2, 400, 30, w/2, 400, 350);
        topGlow.addColorStop(0, hasBgImg ? "rgba(255, 190, 11, 0.2)" : "rgba(255, 190, 11, 0.15)");
        topGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = topGlow;
        ctx.fillRect(0, 0, w, h);

        // 4. Elegant Double Inset Border
        // Outer Inset Border (Gold / Sky Blue thin glow)
        ctx.strokeStyle = "rgba(100, 223, 223, 0.2)";
        ctx.lineWidth = 4;
        ctx.strokeRect(50, 50, w - 100, h - 100);

        // Inner Inset Border (Thin gold / double line)
        ctx.strokeStyle = "rgba(255, 190, 11, 0.25)";
        ctx.lineWidth = 2;
        ctx.strokeRect(66, 66, w - 132, h - 132);

        // 5. Islamic Corner Geometric Ornaments (8-pointed stars at corners)
        const cornerOffset = 90;
        const cornerColor = "rgba(255, 190, 11, 0.6)";
        
        draw8PointedStar(cornerOffset, cornerOffset, 8, 30, 14, cornerColor); // Top-Left
        draw8PointedStar(w - cornerOffset, cornerOffset, 8, 30, 14, cornerColor); // Top-Right
        draw8PointedStar(cornerOffset, h - cornerOffset, 8, 30, 14, cornerColor); // Bottom-Left
        draw8PointedStar(w - cornerOffset, h - cornerOffset, 8, 30, 14, cornerColor); // Bottom-Right

        // Small corner-connecting lines
        ctx.strokeStyle = "rgba(255, 190, 11, 0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Top-Left corner extension
        ctx.moveTo(cornerOffset, 66); ctx.lineTo(cornerOffset, 140);
        ctx.moveTo(66, cornerOffset); ctx.lineTo(140, cornerOffset);
        // Top-Right
        ctx.moveTo(w - cornerOffset, 66); ctx.lineTo(w - cornerOffset, 140);
        ctx.moveTo(w - 66, cornerOffset); ctx.lineTo(w - 140, cornerOffset);
        // Bottom-Left
        ctx.moveTo(cornerOffset, h - 66); ctx.lineTo(cornerOffset, h - 140);
        ctx.moveTo(66, h - cornerOffset); ctx.lineTo(140, h - cornerOffset);
        // Bottom-Right
        ctx.moveTo(w - cornerOffset, h - 66); ctx.lineTo(w - cornerOffset, h - 140);
        ctx.moveTo(w - 66, h - cornerOffset); ctx.lineTo(w - 140, h - cornerOffset);
        ctx.stroke();

        // 6. Draw Sparkling Background Stars in Canvas
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        for (let s = 0; s < 15; s++) {
            const starX = Math.random() * (w - 200) + 100;
            const starY = Math.random() * (h - 200) + 100;
            const size = Math.random() * 3 + 1.5;
            
            ctx.beginPath();
            ctx.arc(starX, starY, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // 7 & 8. Draw Calligraphy Image
        let calligraphyImg;
        try {
            if (typeof CALLIGRAPHY_IMAGE_BASE64 !== "undefined") {
                calligraphyImg = await loadImage(CALLIGRAPHY_IMAGE_BASE64);
            } else {
                calligraphyImg = await loadImage("calligraphy.png");
            }
        } catch (e) {
            console.warn("Could not load calligraphy image.", e);
        }

        if (calligraphyImg) {
            const calW = 700;
            const calH = Math.round(calligraphyImg.naturalHeight * (calW / calligraphyImg.naturalWidth));
            const calX = (w - calW) / 2;
            const calY = 120; // positioned so bottom (~820) is just above the name at 890

            // Process image: remove white background, keep strokes
            const tmpCanvas = document.createElement("canvas");
            tmpCanvas.width = calW;
            tmpCanvas.height = calH || 400; // Fallback height if calc fails
            const tmpCtx = tmpCanvas.getContext("2d");
            tmpCtx.drawImage(calligraphyImg, 0, 0, calW, calH);

            try {
                const imgData = tmpCtx.getImageData(0, 0, calW, tmpCanvas.height);
                const d = imgData.data;
                for (let i = 0; i < d.length; i += 4) {
                    const r = d[i], g = d[i+1], b = d[i+2];
                    const brightness = (r + g + b) / 3;
                    const isGolden = r > 160 && g > 120 && b < 80;

                    if (brightness > 210) {
                        // White/near-white → fully transparent
                        d[i+3] = 0;
                    } else if (isGolden) {
                        // Golden pixels → keep golden, full opacity
                        d[i]   = 255;
                        d[i+1] = 200;
                        d[i+2] = 0;
                        d[i+3] = 255;
                    } else {
                        // Dark/gray strokes → white-cream color with proportional opacity
                        const alpha = Math.min(255, Math.round((210 - brightness) * 2));
                        d[i]   = 255;
                        d[i+1] = 245;
                        d[i+2] = 220;
                        d[i+3] = alpha;
                    }
                }
                tmpCtx.putImageData(imgData, 0, 0);
            } catch (secErr) {
                console.warn("Could not process calligraphy pixels due to security restrictions. Drawing original.", secErr);
            }

            // Draw processed calligraphy onto main canvas
            ctx.drawImage(tmpCanvas, calX, calY);
        }

        // 9. Render User Name
        // Glowing Background behind name to stand out
        const nameGlow = ctx.createRadialGradient(w/2, 870, 20, w/2, 870, 280);
        nameGlow.addColorStop(0, "rgba(100, 223, 223, 0.15)");
        nameGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = nameGlow;
        ctx.fillRect(w/2 - 400, 750, 800, 240);

        // Dynamic font size adjustment based on name length
        let fontSize = 120; // الحجم الافتراضي
        const maxNameWidth = 850; // أقصى عرض مسموح به للاسم في التصميم
        ctx.font = `900 ${fontSize}px Zain, Cairo, sans-serif`; 
        
        // تقليل حجم الخط تدريجياً حتى يتناسب مع العرض المسموح به
        while (ctx.measureText(name).width > maxNameWidth && fontSize > 40) {
            fontSize -= 5;
            ctx.font = `900 ${fontSize}px Zain, Cairo, sans-serif`;
        }

        ctx.textAlign = "center";
        
        // Name shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 6;
        
        // Blue to cyan gradient for name
        const nameGrad = ctx.createLinearGradient(0, 810, 0, 930);
        nameGrad.addColorStop(0, "#FFFFFF");
        nameGrad.addColorStop(0.5, "#E0F7FA");
        nameGrad.addColorStop(1, "#64DFDF");
        ctx.fillStyle = nameGrad;
        
        // Draw user name (e.g. "عبد الرحمن")
        ctx.fillText(name, w / 2, 890);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // 10. Draw Gender-Specific Card Greeting Text
        const greetingText = `بأسمى عبارات التهاني والتبريكات
نهنئكم بحلول عيد الأضحى المبارك 🌙✨
سائلين المولى أن يملأ أيامكم فرحًا وسعادة
وأن يعيده عليكم أعوامًا عديدة بالخير واليُمن والبركات
كل عام وأنتم بخير 🤍`;
            
        ctx.font = "500 52px Tajawal";
        
        // White-blue text gradient for the greeting message
        const textGrad = ctx.createLinearGradient(0, 1100, 0, 1350);
        textGrad.addColorStop(0, "#FFFFFF");
        textGrad.addColorStop(1, "#CCD6F6");
        ctx.fillStyle = textGrad;
        
        // Text Shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        // Wrap and draw message
        wrapAndDrawText(greetingText, w / 2, 1250, 860, 85);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // 11. Bottom Branding Signature: Logo Image
        // Mini gold dividers at bottom
        ctx.strokeStyle = "rgba(100, 223, 223, 0.2)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 120, h - 320);
        ctx.lineTo(w / 2 + 120, h - 320);
        ctx.stroke();

        // Load and Draw Logo Image with Screen Blending Mode
        let logoImg;
        try {
            if (typeof LOGO_IMAGE_BASE64 !== "undefined") {
                logoImg = await loadImage(LOGO_IMAGE_BASE64);
            } else {
                logoImg = await loadImage("logo.png");
            }
        } catch (e) {
            console.warn("Could not load logo image for canvas, falling back to text signature", e);
        }

        if (logoImg) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            // Draw centered logo (180x180)
            const logoW = 180;
            const logoH = 180;
            ctx.drawImage(logoImg, w / 2 - logoW / 2, h - 280, logoW, logoH);
            ctx.restore();
        } else {
            // Fallback to text signature if logo fails to load
            ctx.font = "bold 44px Cairo";
            ctx.fillStyle = "#64DFDF";
            
            // Soft glowing text
            ctx.shadowColor = "rgba(100, 223, 223, 0.5)";
            ctx.shadowBlur = 10;
            ctx.fillText("من سعي 💙", w / 2, h - 230);
        }

        // 12. إضافة معرف الإنستجرام (@saey.om)
        ctx.font = "400 32px Cairo";
        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        ctx.textAlign = "center";
        ctx.shadowBlur = 0;
        ctx.fillText("saey.om@", w / 2, h - 70);

        ctx.shadowBlur = 0; // Final cleanup
    }

    // Direct Image Download (Triggered by button)
    downloadBtn.addEventListener("click", () => {
        // Ensure image is fully drawn
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "123.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast("تم بدء تحميل الصورة بنجاح! 💾");
        }, "image/png");
    });

    // Reset Form / Create Another Card
    editBtn.addEventListener("click", () => {
        resultSection.classList.add("hidden");
        inputSection.classList.remove("hidden");
        
        // Remove load flags
        previewWrapper.classList.remove("loaded");
        previewImage.src = "";
        
        // Retain name but select input for convenience
        userNameInput.focus();
        userNameInput.select();
    });
});
