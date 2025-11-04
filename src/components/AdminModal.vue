<template>
  <div v-if="showModal" class="admin-modal-overlay">
    <div class="admin-modal">
      <div class="modal-header">
        <h2>Select Region</h2>
        <div class="header-buttons">
          <button v-if="showCloseButton" class="reset-button" @click="resetRegion" title="Clear stored region">Reset</button>
          <button v-if="showCloseButton" class="close-button" @click="closeModal">×</button>
        </div>
      </div>
      
      <div class="modal-content">
        <div v-if="currentRegion" class="current-region-display">
          <p><strong>Current Region:</strong> {{ currentRegion }} {{ currentRegion === 'ASN' ? '(Houston)' : '(New Orleans)' }}</p>
        </div>
        <p>Please select the region for this quiz session:</p>
        
        <div class="region-buttons">
          <button 
            class="region-button asn-button"
            @click="selectRegion('ASN')"
          >
            <div class="region-info">
              <h3>ASN</h3>
              <p>Houston</p>
              <p>Questions 4-12</p>
            </div>
          </button>
          
          <button 
            class="region-button aha-button"
            @click="selectRegion('AHA')"
          >
            <div class="region-info">
              <h3>AHA</h3>
              <p>New Orleans</p>
              <p>Questions 13-18</p>
            </div>
          </button>
        </div>
        
        <!-- Admin Actions - only show in admin mode -->
        <div v-if="isAdminMode" class="admin-actions">
          <h3>Admin Actions</h3>
          <div class="admin-buttons">
            <button 
              class="admin-button clear-button"
              @click="clearLeaderboard"
            >
              Clear Leaderboard
            </button>
            
            <button 
              class="admin-button export-button"
              @click="exportCSV"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  showModal: {
    type: Boolean,
    required: true
  },
  isAdminMode: {
    type: Boolean,
    default: false
  },
  currentRegion: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['regionSelected', 'close', 'reset', 'clearLeaderboard', 'exportCSV']);

// Show close button only in admin mode (when region is already set)
const showCloseButton = computed(() => props.isAdminMode);

function selectRegion(region) {
  // Store region in localStorage
  localStorage.setItem('quizRegion', region);
  
  // Emit the selection
  emit('regionSelected', region);
}

function closeModal() {
  emit('close');
}

function resetRegion() {
  // Clear region from localStorage
  localStorage.removeItem('quizRegion');
  
  // Emit reset event
  emit('reset');
}

function clearLeaderboard() {
  if (confirm('Are you sure you want to clear all leaderboard data? This action cannot be undone.')) {
    emit('clearLeaderboard');
  }
}

function exportCSV() {
  emit('exportCSV');
}
</script>

<style scoped>
.admin-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.admin-modal {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  color: #003B45;
  font-family: 'Bebas Neue Pro', sans-serif;
  font-size: 32px;
}

.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.reset-button {
  background: #ff6b6b;
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}

.reset-button:hover {
  background: #e55555;
  transform: translateY(-1px);
}

.close-button {
  background: none;
  border: none;
  font-size: 32px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #f0f0f0;
}

.current-region-display {
  background: #e8f4fd;
  border: 2px solid #007bff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: center;
}

.current-region-display p {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #003B45;
}

.modal-content p {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.region-buttons {
  display: flex;
  gap: 30px;
  justify-content: center;
}

.region-button {
  background: #f8f9fa;
  border: 3px solid #dee2e6;
  border-radius: 12px;
  padding: 30px 20px;
  min-width: 200px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.region-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.asn-button {
  border-color: #007bff;
}

.asn-button:hover {
  background: #e7f3ff;
  border-color: #0056b3;
}

.aha-button {
  border-color: #28a745;
}

.aha-button:hover {
  background: #e8f5e8;
  border-color: #1e7e34;
}

.region-info h3 {
  margin: 0 0 10px 0;
  font-family: 'Bebas Neue Pro', sans-serif;
  font-size: 28px;
  color: #003B45;
}

.region-info p {
  margin: 5px 0;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #666;
}

/* Admin Actions Section */
.admin-actions {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #e9ecef;
}

.admin-actions h3 {
  margin: 0 0 20px 0;
  font-family: 'Bebas Neue Pro', sans-serif;
  font-size: 24px;
  color: #003B45;
  text-align: center;
}

.admin-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.admin-button {
  background: #6c757d;
  border: none;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  min-width: 150px;
}

.admin-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.clear-button {
  background: #dc3545;
}

.clear-button:hover {
  background: #c82333;
}

.export-button {
  background: #28a745;
}

.export-button:hover {
  background: #218838;
}

@media (max-width: 768px) {
  .region-buttons {
    flex-direction: column;
    gap: 20px;
  }
  
  .region-button {
    min-width: auto;
  }
  
  .admin-buttons {
    flex-direction: column;
    gap: 15px;
  }
  
  .admin-button {
    min-width: auto;
  }
  
  .admin-modal {
    padding: 20px;
    margin: 20px;
  }
}
</style>