<template>
  <div class="post-manager">
    <h2>Manage Posts</h2>
    
    <!-- Post Creation Form -->
    <div class="post-form">
      <h3>Create New Post</h3>
      <form @submit.prevent="createPost">
        <div class="form-group">
          <label for="image">Image:</label>
          <input 
            type="file" 
            id="image" 
            accept="image/*" 
            @change="handleImageChange"
            required
          >
          <div v-if="imagePreview" class="image-preview">
            <img :src="imagePreview" alt="Preview">
          </div>
        </div>
        
        <div class="form-group">
          <label for="description">Description:</label>
          <textarea 
            id="description" 
            v-model="description" 
            required
            rows="4"
          ></textarea>
        </div>
        
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Creating...' : 'Create Post' }}
        </button>
      </form>
    </div>

    <!-- Posts List -->
    <div class="posts-list">
      <h3>Existing Posts</h3>
      <div v-if="loading" class="loading">Loading posts...</div>
      <div v-else-if="posts.length === 0" class="no-posts">No posts yet</div>
      <div v-else class="posts-grid">
        <div v-for="post in posts" :key="post.id" class="post-card">
          <img :src="post.image" :alt="post.description">
          <p class="description">{{ post.description }}</p>
          <button @click="deletePost(post.id)" class="delete-btn">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default {
  name: 'PostManager',
  data() {
    return {
      posts: [],
      description: '',
      imageFile: null,
      imagePreview: null,
      isSubmitting: false,
      loading: true
    }
  },
  methods: {
    async fetchPosts() {
      try {
        const response = await fetch(`${API_URL}/api/posts`)
        const posts = await response.json()
        // Update image URLs to use the full backend URL
        this.posts = posts.map(post => ({
          ...post,
          image: `${API_URL}${post.image}`
        }))
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        this.loading = false
      }
    },
    handleImageChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.imageFile = file
        this.imagePreview = URL.createObjectURL(file)
      }
    },
    async createPost() {
      if (!this.imageFile || !this.description) return

      this.isSubmitting = true
      const formData = new FormData()
      formData.append('image', this.imageFile)
      formData.append('description', this.description)

      try {
        const response = await fetch(`${API_URL}/api/posts`, {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const newPost = await response.json()
          this.posts.unshift(newPost)
          this.resetForm()
        } else {
          throw new Error('Failed to create post')
        }
      } catch (error) {
        console.error('Error creating post:', error)
        alert('Failed to create post. Please try again.')
      } finally {
        this.isSubmitting = false
      }
    },
    async deletePost(id) {
      if (!confirm('Are you sure you want to delete this post?')) return

      try {
        const response = await fetch(`${API_URL}/api/posts/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          this.posts = this.posts.filter(post => post.id !== id)
        } else {
          throw new Error('Failed to delete post')
        }
      } catch (error) {
        console.error('Error deleting post:', error)
        alert('Failed to delete post. Please try again.')
      }
    },
    resetForm() {
      this.description = ''
      this.imageFile = null
      this.imagePreview = null
      if (this.$refs.imageInput) {
        this.$refs.imageInput.value = ''
      }
    }
  },
  mounted() {
    this.fetchPosts()
  }
}
</script>

<style scoped>
.post-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.post-form {
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

input[type="file"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
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

.image-preview {
  margin-top: 10px;
  max-width: 300px;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.post-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.post-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.description {
  padding: 15px;
  margin: 0;
}

.delete-btn {
  background: #ff4444;
  margin: 10px;
}

.loading, .no-posts {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style> 