class ColorFlipper {
    constructor() {
        // DOM Elements
        this.elements = {
            appContainer: document.querySelector('.app-container'),
            colorPreview: document.getElementById('colorPreview'),
            colorValue: document.getElementById('colorValue'),
            randomColorBtn: document.getElementById('randomColorBtn'),
            pickColorBtn: document.getElementById('pickColorBtn'),
            colorPicker: document.getElementById('colorPicker'),
            prevColorBtn: document.getElementById('prevColorBtn'),
            nextColorBtn: document.getElementById('nextColorBtn'),
            resetColorBtn: document.getElementById('resetColorBtn'),
            copyColorBtn: document.getElementById('copyColorBtn'),
            saveColorBtn: document.getElementById('saveColorBtn'),
            toggleHistoryBtn: document.getElementById('toggleHistoryBtn'),
            toggleFormatBtn: document.getElementById('toggleFormatBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            closeHistoryBtn: document.getElementById('closeHistoryBtn'),
            closeFavoritesBtn: document.getElementById('closeFavoritesBtn'),
            historyPanel: document.getElementById('historyPanel'),
            favoritesPanel: document.getElementById('favoritesPanel'),
            historyGrid: document.getElementById('historyGrid'),
            favoritesGrid: document.getElementById('favoritesGrid'),
            presetColors: document.getElementById('presetColors'),
            toast: document.getElementById('toast'),
            settingsModal: document.getElementById('settingsModal'),
            closeSettingsBtn: document.getElementById('closeSettingsBtn'),
            saveSettingsBtn: document.getElementById('saveSettingsBtn'),
            historySize: document.getElementById('historySize'),
            animationSpeed: document.getElementById('animationSpeed'),
            saveHistory: document.getElementById('saveHistory'),
            enableShortcuts: document.getElementById('enableShortcuts')
        };

        // State
        this.state = {
            currentColor: '#FFFFFF',
            colorHistory: [],
            favorites: [],
            historyIndex: -1,
            colorFormat: 'hex',
            settings: {
                historySize: 10,
                animationSpeed: 'medium',
                saveHistory: true,
                enableShortcuts: true
            }
        };

        // Preset colors
        this.presetColors = [
            '#FF6B6B', '#48DBFB', '#1DD1A1', '#FECA57', '#5F27CD',
            '#FF9FF3', '#FECA57', '#FF9F43', '#EE5253', '#0ABDE3',
            '#10AC84', '#00D2D3', '#54A0FF', '#5F27CD', '#C8D6E5',
            '#576574', '#341F97', '#01A3A4', '#2E86DE', '#EE5253'
        ];

        // Initialize
        this.init();
    }

    init() {
        // Load settings and data
        this.loadSettings();
        this.loadFavorites();
        this.loadHistory();

        // Setup UI
        this.updateColor(this.state.currentColor);
        this.generatePresetColors();
        this.renderHistory();
        this.renderFavorites();

        // Event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Color control buttons
        this.elements.randomColorBtn.addEventListener('click', () => this.generateRandomColor());
        this.elements.pickColorBtn.addEventListener('click', () => this.elements.colorPicker.click());
        this.elements.colorPicker.addEventListener('input', (e) => this.updateColor(e.target.value));
        this.elements.prevColorBtn.addEventListener('click', () => this.navigateHistory(-1));
        this.elements.nextColorBtn.addEventListener('click', () => this.navigateHistory(1));
        this.elements.resetColorBtn.addEventListener('click', () => this.resetColor());
        this.elements.copyColorBtn.addEventListener('click', () => this.copyColorToClipboard());
        this.elements.saveColorBtn.addEventListener('click', () => this.toggleFavorite());

        // Panel toggles
        this.elements.toggleHistoryBtn.addEventListener('click', () => this.togglePanel('history'));
        this.elements.closeHistoryBtn.addEventListener('click', () => this.togglePanel('history'));
        this.elements.toggleFormatBtn.addEventListener('click', () => this.toggleColorFormat());
        this.elements.settingsBtn.addEventListener('click', () => this.toggleSettingsModal(true));
        this.elements.closeSettingsBtn.addEventListener('click', () => this.toggleSettingsModal(false));
        this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettings());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.state.settings.enableShortcuts) return;

            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.generateRandomColor();
                    break;
                case 'KeyR':
                    this.resetColor();
                    break;
                case 'KeyC':
                    this.copyColorToClipboard();
                    break;
                case 'ArrowLeft':
                    this.navigateHistory(-1);
                    break;
                case 'ArrowRight':
                    this.navigateHistory(1);
                    break;
                case 'KeyH':
                    this.togglePanel('history');
                    break;
                case 'KeyF':
                    this.togglePanel('favorites');
                    break;
                case 'KeyS':
                    this.toggleSettingsModal(true);
                    break;
            }
        });
    }

    // Color Management
    updateColor(color, addToHistory = true) {
        // Format color to HEX
        color = this.formatColor(color);
        
        // Update state
        this.state.currentColor = color;
        
        // Update UI
        this.elements.colorPreview.style.backgroundColor = color;
        this.updateColorValueDisplay();
        this.elements.colorPicker.value = color.toLowerCase();
        
        // Add to history if needed
        if (addToHistory) {
            this.addToHistory(color);
        }
        
        // Update document background with animation
        this.animateBackgroundChange(color);
    }

    formatColor(color) {
        // Convert rgb() to hex if needed
        if (color.startsWith('rgb')) {
            return this.rgbToHex(color);
        }
        
        // Ensure hex format is 6 digits
        if (color.startsWith('#') && color.length === 4) {
            color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
        }
        
        return color.toUpperCase();
    }

    updateColorValueDisplay() {
        if (this.state.colorFormat === 'hex') {
            this.elements.colorValue.textContent = this.state.currentColor;
        } else {
            this.elements.colorValue.textContent = this.hexToRgb(this.state.currentColor);
        }
    }

    animateBackgroundChange(color) {
        const speed = {
            fast: '0.3s',
            medium: '0.5s',
            slow: '1s'
        }[this.state.settings.animationSpeed] || '0.5s';

        document.body.style.transition = `background-color ${speed} ease`;
        document.body.style.backgroundColor = color;
    }

    // Color Generation
    generateRandomColor() {
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        this.updateColor(randomColor);
    }

    // History Management
    addToHistory(color) {
        // Don't add if same as current color
        if (this.state.colorHistory[0] === color) return;
        
        // Add to beginning of array
        this.state.colorHistory.unshift(color);
        
        // Trim history if needed
        if (this.state.colorHistory.length > this.state.settings.historySize) {
            this.state.colorHistory.pop();
        }
        
        // Reset history navigation index
        this.state.historyIndex = -1;
        
        // Update UI
        this.renderHistory();
        
        // Save to localStorage if enabled
        if (this.state.settings.saveHistory) {
            localStorage.setItem('colorHistory', JSON.stringify(this.state.colorHistory));
        }
    }

    navigateHistory(direction) {
        // Can't navigate if no history
        if (this.state.colorHistory.length === 0) return;
        
        // Calculate new index
        let newIndex = this.state.historyIndex + direction;
        
        // Clamp the index to valid range
        newIndex = Math.max(-1, Math.min(newIndex, this.state.colorHistory.length - 1));
        
        // Don't navigate if we're at the limits
        if ((direction === -1 && newIndex === this.state.historyIndex) || 
            (direction === 1 && newIndex === this.state.historyIndex)) {
            return;
        }
        
        // Update index
        this.state.historyIndex = newIndex;
        
        // Get the color from history
        const color = this.state.colorHistory[this.state.historyIndex];
        
        // Update color without adding to history
        this.updateColor(color, false);
    }

    renderHistory() {
        this.elements.historyGrid.innerHTML = '';
        
        this.state.colorHistory.forEach((color, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.style.backgroundColor = color;
            historyItem.title = color;
            
            historyItem.addEventListener('click', () => {
                this.updateColor(color);
                this.state.historyIndex = -1; // Reset navigation index
            });
            
            this.elements.historyGrid.appendChild(historyItem);
        });
    }

    // Favorites Management
    toggleFavorite() {
        const index = this.state.favorites.indexOf(this.state.currentColor);
        
        if (index === -1) {
            // Add to favorites
            this.state.favorites.unshift(this.state.currentColor);
            this.showToast('Added to favorites');
            this.elements.saveColorBtn.innerHTML = '<i class="fas fa-heart"></i>';
            this.elements.saveColorBtn.classList.add('active');
        } else {
            // Remove from favorites
            this.state.favorites.splice(index, 1);
            this.showToast('Removed from favorites');
            this.elements.saveColorBtn.innerHTML = '<i class="far fa-heart"></i>';
            this.elements.saveColorBtn.classList.remove('active');
        }
        
        // Update UI
        this.renderFavorites();
        
        // Save to localStorage
        localStorage.setItem('favoriteColors', JSON.stringify(this.state.favorites));
    }

    renderFavorites() {
        this.elements.favoritesGrid.innerHTML = '';
        
        // Update save button state
        const isFavorite = this.state.favorites.includes(this.state.currentColor);
        this.elements.saveColorBtn.innerHTML = isFavorite ? 
            '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
        this.elements.saveColorBtn.classList.toggle('active', isFavorite);
        
        // Render favorites grid
        this.state.favorites.forEach(color => {
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'favorite-item';
            favoriteItem.style.backgroundColor = color;
            favoriteItem.title = color;
            
            // Add remove button
            const removeBtn = document.createElement('span');
            removeBtn.className = 'remove-favorite';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFavorite(color);
            });
            
            favoriteItem.appendChild(removeBtn);
            
            favoriteItem.addEventListener('click', () => {
                this.updateColor(color);
            });
            
            this.elements.favoritesGrid.appendChild(favoriteItem);
        });
    }

    removeFavorite(color) {
        const index = this.state.favorites.indexOf(color);
        if (index !== -1) {
            this.state.favorites.splice(index, 1);
            this.renderFavorites();
            localStorage.setItem('favoriteColors', JSON.stringify(this.state.favorites));
            
            if (color === this.state.currentColor) {
                this.elements.saveColorBtn.innerHTML = '<i class="far fa-heart"></i>';
                this.elements.saveColorBtn.classList.remove('active');
            }
        }
    }

    // Preset Colors
    generatePresetColors() {
        this.elements.presetColors.innerHTML = '';
        
        this.presetColors.forEach(color => {
            const preset = document.createElement('div');
            preset.className = 'preset-color';
            preset.style.backgroundColor = color;
            preset.title = color;
            
            preset.addEventListener('click', () => {
                this.updateColor(color);
            });
            
            this.elements.presetColors.appendChild(preset);
        });
    }

    // UI Controls
    togglePanel(panel) {
        if (panel === 'history') {
            this.elements.historyPanel.classList.toggle('active');
            this.elements.favoritesPanel.classList.remove('active');
        } else if (panel === 'favorites') {
            this.elements.favoritesPanel.classList.toggle('active');
            this.elements.historyPanel.classList.remove('active');
        }
    }

    toggleColorFormat() {
        this.state.colorFormat = this.state.colorFormat === 'hex' ? 'rgb' : 'hex';
        this.updateColorValueDisplay();
    }

    toggleSettingsModal(show) {
        this.elements.settingsModal.classList.toggle('active', show);
    }

    // Utility Functions
    resetColor() {
        this.updateColor('#FFFFFF');
    }

    async copyColorToClipboard() {
        try {
            const text = this.state.colorFormat === 'hex' ? 
                this.state.currentColor : this.hexToRgb(this.state.currentColor);
            
            await navigator.clipboard.writeText(text);
            this.showToast(`Copied: ${text}`);
        } catch (err) {
            this.showToast('Failed to copy');
            console.error('Failed to copy: ', err);
        }
    }

    showToast(message) {
        this.elements.toast.textContent = message;
        this.elements.toast.classList.add('show');
        
        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, 2000);
    }

    // Color Conversion
    hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse r, g, b values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    rgbToHex(rgb) {
        // Get rgb values
        const rgbValues = rgb.match(/\d+/g);
        if (!rgbValues || rgbValues.length < 3) return '#FFFFFF';
        
        // Convert to hex
        return '#' + rgbValues.map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
    }

    // Data Persistence
    loadSettings() {
        const savedSettings = localStorage.getItem('colorFlipperSettings');
        if (savedSettings) {
            this.state.settings = JSON.parse(savedSettings);
            
            // Update UI to match loaded settings
            this.elements.historySize.value = this.state.settings.historySize;
            this.elements.animationSpeed.value = this.state.settings.animationSpeed;
            this.elements.saveHistory.checked = this.state.settings.saveHistory;
            this.elements.enableShortcuts.checked = this.state.settings.enableShortcuts;
        }
    }

    saveSettings() {
        // Update state with current UI values
        this.state.settings = {
            historySize: parseInt(this.elements.historySize.value),
            animationSpeed: this.elements.animationSpeed.value,
            saveHistory: this.elements.saveHistory.checked,
            enableShortcuts: this.elements.enableShortcuts.checked
        };
        
        // Save to localStorage
        localStorage.setItem('colorFlipperSettings', JSON.stringify(this.state.settings));
        
        // Trim history if new size is smaller
        if (this.state.colorHistory.length > this.state.settings.historySize) {
            this.state.colorHistory = this.state.colorHistory.slice(0, this.state.settings.historySize);
            this.renderHistory();
        }
        
        // Close modal and show confirmation
        this.toggleSettingsModal(false);
        this.showToast('Settings saved');
    }

    loadHistory() {
        if (this.state.settings.saveHistory) {
            const savedHistory = localStorage.getItem('colorHistory');
            if (savedHistory) {
                this.state.colorHistory = JSON.parse(savedHistory);
                this.renderHistory();
            }
        }
    }

    loadFavorites() {
        const savedFavorites = localStorage.getItem('favoriteColors');
        if (savedFavorites) {
            this.state.favorites = JSON.parse(savedFavorites);
            this.renderFavorites();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const colorFlipper = new ColorFlipper();
});