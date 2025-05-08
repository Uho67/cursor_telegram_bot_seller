<template>
  <div class="button-manager">
    <h2>Manage Bot Buttons</h2>
    
    <!-- Button Creation Form -->
    <div class="button-form">
      <h3>Add New Button</h3>
      <form @submit.prevent="createButton">
        <div class="form-group">
          <label for="name">Button Name:</label>
          <input 
            type="text" 
            id="name" 
            v-model="newButton.name" 
            required
          >
        </div>
        
        <div class="form-group">
          <label for="type">Button Type:</label>
          <select 
            id="type" 
            v-model="newButton.type" 
            required
          >
            <option value="url">URL Link</option>
            <option value="callback">Callback Action</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="value">Value:</label>
          <input 
            type="text" 
            id="value" 
            v-model="newButton.value" 
            required
            :placeholder="newButton.type === 'url' ? 'https://example.com' : 'callback_data'"
          >
        </div>
        
        <div class="form-group">
          <label for="order">Order:</label>
          <input 
            type="number" 
            id="order" 
            v-model="newButton.order" 
            required
            min="1"
          >
        </div>
        
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Creating...' : 'Add Button' }}
        </button>
      </form>
    </div>

    <!-- Buttons List -->
    <div class="buttons-list">
      <h3>Existing Buttons</h3>
      <div v-if="loading" class="loading">Loading buttons...</div>
      <div v-else-if="buttons.length === 0" class="no-buttons">No buttons configured</div>
      <div v-else class="buttons-grid">
        <div v-for="button in buttons" :key="button.id" class="button-card">
          <div class="button-info">
            <h4>{{ button.name }}</h4>
            <p><strong>Type:</strong> {{ button.type }}</p>
            <p><strong>Value:</strong> {{ button.value }}</p>
            <p><strong>Order:</strong> {{ button.order }}</p>
          </div>
          <div class="button-actions">
            <button @click="editButton(button)" class="edit-btn">Edit</button>
            <button @click="deleteButton(button.id)" class="delete-btn">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <h3>Edit Button</h3>
        <form @submit.prevent="updateButton">
          <div class="form-group">
            <label for="edit-name">Button Name:</label>
            <input 
              type="text" 
              id="edit-name" 
              v-model="editingButton.name" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="edit-type">Button Type:</label>
            <select 
              id="edit-type" 
              v-model="editingButton.type" 
              required
            >
              <option value="url">URL Link</option>
              <option value="callback">Callback Action</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="edit-value">Value:</label>
            <input 
              type="text" 
              id="edit-value" 
              v-model="editingButton.value" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="edit-order">Order:</label>
            <input 
              type="number" 
              id="edit-order" 
              v-model="editingButton.order" 
              required
              min="1"
            >
          </div>
          
          <div class="modal-actions">
            <button type="submit" :disabled="isSubmitting">Save Changes</button>
            <button type="button" @click="showEditModal = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ButtonManager',
  data() {
    return {
      buttons: [],
      loading: true,
      isSubmitting: false,
      showEditModal: false,
      newButton: {
        name: '',
        type: 'url',
        value: '',
        order: 1
      },
      editingButton: null
    }
  },
  methods: {
    async fetchButtons() {
      try {
        const response = await fetch('http://localhost:3001/api/buttons')
        this.buttons = await response.json()
      } catch (error) {
        console.error('Error fetching buttons:', error)
      } finally {
        this.loading = false
      }
    },
    async createButton() {
      this.isSubmitting = true
      try {
        const response = await fetch('http://localhost:3001/api/buttons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newButton)
        })
        
        if (response.ok) {
          const newButton = await response.json()
          this.buttons = [...this.buttons, newButton]
          this.resetForm()
        } else {
          throw new Error('Failed to create button')
        }
      } catch (error) {
        console.error('Error creating button:', error)
        alert('Failed to create button. Please try again.')
      } finally {
        this.isSubmitting = false
      }
    },
    editButton(button) {
      this.editingButton = { ...button }
      this.showEditModal = true
    },
    async updateButton() {
      this.isSubmitting = true
      try {
        const response = await fetch(`http://localhost:3001/api/buttons/${this.editingButton.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.editingButton)
        })
        
        if (response.ok) {
          const updatedButton = await response.json()
          this.buttons = this.buttons.map(button => 
            button.id === updatedButton.id ? updatedButton : button
          )
          this.showEditModal = false
        } else {
          throw new Error('Failed to update button')
        }
      } catch (error) {
        console.error('Error updating button:', error)
        alert('Failed to update button. Please try again.')
      } finally {
        this.isSubmitting = false
      }
    },
    async deleteButton(id) {
      if (!confirm('Are you sure you want to delete this button?')) return

      try {
        const response = await fetch(`http://localhost:3001/api/buttons/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          this.buttons = this.buttons.filter(button => button.id !== id)
        } else {
          throw new Error('Failed to delete button')
        }
      } catch (error) {
        console.error('Error deleting button:', error)
        alert('Failed to delete button. Please try again.')
      }
    },
    resetForm() {
      this.newButton = {
        name: '',
        type: 'url',
        value: '',
        order: this.buttons.length + 1
      }
    }
  },
  mounted() {
    this.fetchButtons()
  }
}
</script>

<style scoped>
.button-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.button-form {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.buttons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.button-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.button-info h4 {
  margin: 0 0 10px 0;
}

.button-info p {
  margin: 5px 0;
}

.button-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.edit-btn {
  background: #2196F3;
}

.delete-btn {
  background: #ff4444;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.loading, .no-buttons {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style> 