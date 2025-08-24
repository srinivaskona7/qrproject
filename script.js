class QRSystemManager {
      constructor() {
          this.storageKey = 'qr_codes_data';
          this.maxQRCodes = 5;
          this.isManageMode = false;
          this.currentFile = null;
          
          // DOM Elements
          this.showcase = document.getElementById('qr-showcase');
          this.managementPanel = document.getElementById('management-panel');
          this.manageToggle = document.getElementById('manage-toggle');
          this.qrGrid = document.getElementById('qr-grid');
          this.addQRBtn = document.getElementById('add-qr-btn');
          this.clearAllBtn = document.getElementById('clear-all-btn');
          
          // Stats
          this.totalCount = document.getElementById('total-count');
          this.primaryName = document.getElementById('primary-name');
          
          // Upload Modal
          this.uploadModalOverlay = document.getElementById('upload-modal-overlay');
          this.uploadModalClose = document.getElementById('upload-modal-close');
          this.uploadModalCancel = document.getElementById('upload-modal-cancel');
          this.uploadModalConfirm = document.getElementById('upload-modal-confirm');
          this.qrNameInput = document.getElementById('qr-name-input');
          this.fileUploadArea = document.getElementById('file-upload-area');
          this.qrFileInput = document.getElementById('qr-file-input');
          this.filePreview = document.getElementById('file-preview');
          this.previewImage = document.getElementById('preview-image');
          this.removeFile = document.getElementById('remove-file');
          
          // Confirmation Modal
          this.modalOverlay = document.getElementById('modal-overlay');
          this.modalTitle = document.getElementById('modal-title');
          this.modalMessage = document.getElementById('modal-message');
          this.modalConfirm = document.getElementById('modal-confirm');
          this.modalCancel = document.getElementById('modal-cancel');
          this.modalClose = document.getElementById('modal-close');
          
          // Notification
          this.notificationContainer = document.getElementById('notification-container');
          
          this.init();
      }
  
      init() {
          this.bindEvents();
          this.render();
          this.updateStats();
      }
  
      bindEvents() {
          // Toggle manage mode
          this.manageToggle.addEventListener('click', () => this.toggleManageMode());
          
          // Add QR Code
          this.addQRBtn.addEventListener('click', () => this.showUploadModal());
          
          // Clear All
          this.clearAllBtn.addEventListener('click', () => this.confirmClearAll());
          
          // Upload Modal Events
          this.uploadModalClose.addEventListener('click', () => this.hideUploadModal());
          this.uploadModalCancel.addEventListener('click', () => this.hideUploadModal());
          this.uploadModalConfirm.addEventListener('click', () => this.confirmUpload());
          this.uploadModalOverlay.addEventListener('click', (e) => {
              if (e.target === this.uploadModalOverlay) this.hideUploadModal();
          });
          
          // File Upload Events
          this.fileUploadArea.addEventListener('click', () => this.qrFileInput.click());
          this.fileUploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
          this.fileUploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
          this.fileUploadArea.addEventListener('drop', this.handleDrop.bind(this));
          this.qrFileInput.addEventListener('change', this.handleFileSelect.bind(this));
          this.removeFile.addEventListener('click', this.clearFileSelection.bind(this));
          
          // Name Input Event
          this.qrNameInput.addEventListener('input', this.validateUploadForm.bind(this));
          
          // Confirmation Modal events
          this.modalCancel.addEventListener('click', () => this.hideModal());
          this.modalClose.addEventListener('click', () => this.hideModal());
          this.modalOverlay.addEventListener('click', (e) => {
              if (e.target === this.modalOverlay) this.hideModal();
          });
          
          // Event delegation for dynamic elements
          document.addEventListener('input', this.handleInputChange.bind(this));
          document.addEventListener('change', this.handleRadioChange.bind(this));
      }
  
      // Storage Methods
      getQRCodes() {
          try {
              const data = localStorage.getItem(this.storageKey);
              return data ? JSON.parse(data) : [];
          } catch (error) {
              console.error('Error loading QR codes:', error);
              return [];
          }
      }
  
      saveQRCodes(qrCodes) {
          try {
              localStorage.setItem(this.storageKey, JSON.stringify(qrCodes));
              this.render();
              this.updateStats();
          } catch (error) {
              console.error('Error saving QR codes:', error);
              this.showNotification('Error saving QR codes', 'error');
          }
      }
  
      // UI Management
      toggleManageMode() {
          this.isManageMode = !this.isManageMode;
          
          if (this.isManageMode) {
              this.managementPanel.classList.remove('hidden');
              this.manageToggle.textContent = 'Close Manage';
              this.manageToggle.classList.add('active');
              this.renderManagementGrid();
          } else {
              this.managementPanel.classList.add('hidden');
              this.manageToggle.innerHTML = `
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  <span>Manage QRs</span>
              `;
              this.manageToggle.classList.remove('active');
          }
      }
  
      render() {
          this.renderShowcase();
          if (this.isManageMode) {
              this.renderManagementGrid();
          }
      }
  
      renderShowcase() {
          const qrCodes = this.getQRCodes();
          const primaryQR = qrCodes.find(qr => qr.isPrimary) || qrCodes[0];
          
          if (!primaryQR) {
              this.renderEmptyState();
              return;
          }
          
          this.renderPrimaryQR(primaryQR);
      }
  
      renderEmptyState() {
          this.showcase.innerHTML = `
              <div class="empty-state">
                  <div class="empty-icon">
                      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <rect x="7" y="7" width="3" height="3"/>
                          <rect x="14" y="7" width="3" height="3"/>
                          <rect x="7" y="14" width="3" height="3"/>
                          <rect x="14" y="14" width="3" height="3"/>
                      </svg>
                  </div>
                  <h2>Welcome to Kona Srinivas QR Project</h2>
                  <p>Start by creating your first QR code. Upload an image and give it a name to organize your digital assets efficiently.</p>
                  <button class="primary-button" onclick="qrManager.showUploadModal()">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Create Your First QR Code
                  </button>
              </div>
          `;
      }
  
      renderPrimaryQR(qr) {
          const createdDate = new Date(qr.created).toLocaleDateString();
          
          this.showcase.innerHTML = `
              <div class="qr-card">
                  <img src="${qr.imageData}" alt="${qr.name}" class="qr-image" />
                  <div class="qr-name">${qr.name}</div>
                  <div class="qr-meta">
                      <span class="primary-badge">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                          </svg>
                          Primary QR
                      </span>
                      <span>Created ${createdDate}</span>
                  </div>
              </div>
          `;
      }
  
      renderManagementGrid() {
          const qrCodes = this.getQRCodes();
          
          if (qrCodes.length === 0) {
              this.qrGrid.innerHTML = `
                  <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                      <p>No QR codes to manage. Add your first QR code below.</p>
                  </div>
              `;
          } else {
              this.qrGrid.innerHTML = qrCodes.map((qr, index) => this.createManageCard(qr, index)).join('');
          }
          
          // Update add button state
          this.addQRBtn.disabled = qrCodes.length >= this.maxQRCodes;
          if (qrCodes.length >= this.maxQRCodes) {
              this.addQRBtn.textContent = `Maximum ${this.maxQRCodes} QR codes reached`;
          } else {
              this.addQRBtn.innerHTML = `
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add New QR Code
              `;
          }
      }
  
      createManageCard(qr, index) {
          const createdDate = new Date(qr.created).toLocaleDateString();
          
          return `
              <div class="qr-manage-card ${qr.isPrimary ? 'is-primary' : ''}" data-index="${index}">
                  <div class="qr-manage-header">
                      <img src="${qr.imageData}" alt="${qr.name}" class="qr-thumbnail" />
                      <div class="qr-info">
                          <input 
                              type="text" 
                              class="qr-name-input" 
                              value="${qr.name}"
                              data-index="${index}"
                              placeholder="QR Code Name"
                              maxlength="25"
                          />
                          <small style="color: var(--text-tertiary);">Created ${createdDate}</small>
                      </div>
                  </div>
                  
                  <div class="qr-manage-actions">
                      <label class="primary-radio ${qr.isPrimary ? 'is-primary' : ''}">
                          <input 
                              type="radio" 
                              name="primary-qr" 
                              data-index="${index}"
                              ${qr.isPrimary ? 'checked' : ''}
                          />
                          <span>Primary</span>
                      </label>
                      
                      <button class="secondary-button" onclick="qrManager.changeImage(${index})">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21,15 16,10 5,21"/>
                          </svg>
                          Change
                      </button>
                      
                      <button class="danger-button" onclick="qrManager.deleteQR(${index})" style="padding: var(--space-2) var(--space-3); font-size: 0.875rem;">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="3,6 5,6 21,6"/>
                              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                          </svg>
                          Delete
                      </button>
                  </div>
              </div>
          `;
      }
  
      // Upload Modal Methods
      showUploadModal() {
          const qrCodes = this.getQRCodes();
          
          if (qrCodes.length >= this.maxQRCodes) {
              this.showNotification(`Maximum ${this.maxQRCodes} QR codes allowed`, 'warning');
              return;
          }
  
          this.resetUploadForm();
          this.uploadModalOverlay.classList.add('show');
      }
  
      hideUploadModal() {
          this.uploadModalOverlay.classList.remove('show');
          this.resetUploadForm();
      }
  
      resetUploadForm() {
          this.qrNameInput.value = '';
          this.currentFile = null;
          this.filePreview.classList.add('hidden');
          this.fileUploadArea.classList.remove('hidden');
          this.qrFileInput.value = '';
          this.validateUploadForm();
      }
  
      validateUploadForm() {
          const hasName = this.qrNameInput.value.trim().length > 0;
          const hasFile = this.currentFile !== null;
          this.uploadModalConfirm.disabled = !(hasName && hasFile);
      }
  
      // File Handling
      handleDragOver(e) {
          e.preventDefault();
          this.fileUploadArea.classList.add('dragover');
      }
  
      handleDragLeave(e) {
          e.preventDefault();
          this.fileUploadArea.classList.remove('dragover');
      }
  
      handleDrop(e) {
          e.preventDefault();
          this.fileUploadArea.classList.remove('dragover');
          
          const files = e.dataTransfer.files;
          if (files.length > 0) {
              this.processFile(files[0]);
          }
      }
  
      handleFileSelect(e) {
          const file = e.target.files[0];
          if (file) {
              this.processFile(file);
          }
      }
  
      processFile(file) {
          // Validate file type
          if (!file.type.startsWith('image/')) {
              this.showNotification('Please select a valid image file', 'error');
              return;
          }
  
          // Validate file size (5MB limit)
          if (file.size > 5 * 1024 * 1024) {
              this.showNotification('File size must be less than 5MB', 'error');
              return;
          }
  
          const reader = new FileReader();
          reader.onload = (e) => {
              this.currentFile = e.target.result;
              this.previewImage.src = e.target.result;
              this.fileUploadArea.classList.add('hidden');
              this.filePreview.classList.remove('hidden');
              this.validateUploadForm();
          };
          
          reader.onerror = () => {
              this.showNotification('Error reading file', 'error');
          };
          
          reader.readAsDataURL(file);
      }
  
      clearFileSelection() {
          this.currentFile = null;
          this.filePreview.classList.add('hidden');
          this.fileUploadArea.classList.remove('hidden');
          this.qrFileInput.value = '';
          this.validateUploadForm();
      }
  
      confirmUpload() {
          const name = this.qrNameInput.value.trim();
          
          if (!name || !this.currentFile) {
              this.showNotification('Please provide both name and image', 'error');
              return;
          }
  
          const qrCodes = this.getQRCodes();
          const newQR = {
              id: Date.now().toString(),
              name: name,
              imageData: this.currentFile,
              isPrimary: qrCodes.length === 0, // First QR automatically becomes primary
              created: Date.now()
          };
          
          qrCodes.push(newQR);
          this.saveQRCodes(qrCodes);
          this.hideUploadModal();
          this.showNotification(`QR code "${name}" added successfully!`, 'success');
          
          // If this is the first QR, show it immediately
          if (qrCodes.length === 1) {
              this.renderShowcase();
          }
      }
  
      // QR Operations
      deleteQR(index) {
          const qrCodes = this.getQRCodes();
          const qr = qrCodes[index];
          
          this.showConfirmModal(
              'Delete QR Code',
              `Are you sure you want to delete "${qr.name}"? This action cannot be undone.`,
              () => {
                  qrCodes.splice(index, 1);
                  
                  // If deleted QR was primary and others exist, make first QR primary
                  if (qr.isPrimary && qrCodes.length > 0) {
                      qrCodes[0].isPrimary = true;
                  }
                  
                  this.saveQRCodes(qrCodes);
                  this.showNotification(`QR code "${qr.name}" deleted successfully`, 'success');
                  
                  // Update showcase
                  this.renderShowcase();
              }
          );
      }
  
      changeImage(index) {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.onchange = (e) => {
              const file = e.target.files[0];
              if (!file) return;
  
              if (!file.type.startsWith('image/')) {
                  this.showNotification('Please select a valid image file', 'error');
                  return;
              }
  
              if (file.size > 5 * 1024 * 1024) {
                  this.showNotification('File size must be less than 5MB', 'error');
                  return;
              }
  
              const reader = new FileReader();
              reader.onload = (event) => {
                  const qrCodes = this.getQRCodes();
                  qrCodes[index].imageData = event.target.result;
                  this.saveQRCodes(qrCodes);
                  this.showNotification('QR image updated successfully!', 'success');
                  
                  // Update showcase if this is the primary QR
                  if (qrCodes[index].isPrimary) {
                      this.renderShowcase();
                  }
              };
              reader.readAsDataURL(file);
          };
          fileInput.click();
      }
  
      confirmClearAll() {
          const qrCodes = this.getQRCodes();
          if (qrCodes.length === 0) return;
  
          this.showConfirmModal(
              'Clear All QR Codes',
              `This will permanently delete all ${qrCodes.length} QR codes. This action cannot be undone.`,
              () => {
                  localStorage.removeItem(this.storageKey);
                  this.render();
                  this.updateStats();
                  this.showNotification('All QR codes cleared successfully', 'success');
              }
          );
      }
  
      // Event Handlers
      handleInputChange(e) {
          if (e.target.classList.contains('qr-name-input')) {
              const index = parseInt(e.target.dataset.index);
              const qrCodes = this.getQRCodes();
              
              if (qrCodes[index]) {
                  qrCodes[index].name = e.target.value.trim();
                  this.saveQRCodes(qrCodes);
                  
                  // Update showcase if this is the primary QR
                  if (qrCodes[index].isPrimary) {
                      this.renderShowcase();
                  }
              }
          }
      }
  
      handleRadioChange(e) {
          if (e.target.type === 'radio' && e.target.name === 'primary-qr') {
              const index = parseInt(e.target.dataset.index);
              const qrCodes = this.getQRCodes();
              
              // Update primary status
              qrCodes.forEach((qr, i) => {
                  qr.isPrimary = i === index;
              });
              
              this.saveQRCodes(qrCodes);
              this.showNotification(`"${qrCodes[index].name}" set as primary QR!`, 'success');
              
              // Re-render to update UI
              this.renderShowcase();
              this.renderManagementGrid();
          }
      }
  
      // Modal Methods
      showConfirmModal(title, message, onConfirm) {
          this.modalTitle.textContent = title;
          this.modalMessage.textContent = message;
          this.modalOverlay.classList.add('show');
          
          this.modalConfirm.onclick = () => {
              this.hideModal();
              onConfirm();
          };
      }
  
      hideModal() {
          this.modalOverlay.classList.remove('show');
      }
  
      // Stats Update
      updateStats() {
          const qrCodes = this.getQRCodes();
          const primaryQR = qrCodes.find(qr => qr.isPrimary);
          
          this.totalCount.textContent = qrCodes.length;
          this.primaryName.textContent = primaryQR ? primaryQR.name : 'None';
      }
  
      // Notification System
      showNotification(message, type = 'success') {
          const notification = document.createElement('div');
          notification.className = `notification ${type}`;
          notification.textContent = message;
          
          this.notificationContainer.appendChild(notification);
          
          // Auto remove after 4 seconds
          setTimeout(() => {
              if (notification.parentNode) {
                  notification.remove();
              }
          }, 4000);
          
          // Click to dismiss
          notification.addEventListener('click', () => {
              notification.remove();
          });
      }
  }
  
  // Initialize the QR System
  let qrManager;
  
  document.addEventListener('DOMContentLoaded', () => {
      qrManager = new QRSystemManager();
  });
  