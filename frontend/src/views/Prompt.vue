<template>
  <div class="page-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <h2>Alina infos</h2>
      <p>ID: {{ userData.alina_id }}</p>
      <p>Name: Alina de {{ userData.firstname }}</p>
      <p>Region: France</p>

      <h2>Options</h2>

      <!-- Accent Cascader -->
      <q-cascader
        v-model="selectedAccent"
        :options="accentOptions"
        label="Accent"
        class="cascader"
      />

      <!-- Voice Gender Cascader -->
      <q-cascader
        v-model="selectedGender"
        :options="genderOptions"
        label="Voice Gender"
        class="cascader"
      />

      <!-- Age Cascader -->
      <q-cascader
        v-model="selectedAge"
        :options="ageOptions"
        label="Age"
        class="cascader"
      />

      <!-- Disconnect and Settings Buttons -->
      <div class="button-group">
        <q-button type="icon" @click="openSettings" icon="q-icon-cog-stroke" circle size="medium"/>
        <q-button @click="disconnect" theme="secondary">Disconnect</q-button>
      </div>
    </aside>

    <!-- Main Content (Feed of Cards) -->
    <main class="content">
      <div class="feed">
        <Card
          v-for="(item, index) in feedData"
          :key="index"
          :question="item.question"
          :answer="item.answer"
          :audioSrc="item.audio_response_s3_url"
        />
      </div>

      <!-- Loading Indicator -->
      <div v-if="loading" class="loading-indicator">
        <q-button type="icon" icon="q-icon-hourglass" />
        <span>Waiting for response...</span>
      </div>

      <!-- Prompt Section at the Bottom -->
      <div class="prompt">
        <q-input type="text" placeholder="Type your prompt here..." v-model="userPrompt" />
        <q-button @click="submitPrompt">Submit</q-button>
      </div>
    </main>

    <!-- Modal Overlay -->
    <div v-if="showSettingsModal" class="modal-overlay" @click.self="closeSettings">
      <div class="modal-content">
        <h2>Settings</h2>
        <q-form>
          <q-form-item label="Modify Alina ID">
            <q-input v-model="settings.alinaId" placeholder="Enter new Alina ID" />
          </q-form-item>

          <q-form-item label="Modify Password">
            <q-input v-model="settings.password" type="password" placeholder="Enter new password" />
          </q-form-item>

          <q-form-item label="Modify Email">
            <q-input v-model="settings.email" type="email" placeholder="Enter new email" />
          </q-form-item>

          <q-button @click="saveSettings">Save Changes</q-button>
        </q-form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getUser, getUserAsks, postAsk } from '@/apiService';
import Card from '@/components/Card.vue';

export default {
  name: 'Prompt',
  components: {
    Card
  },
  setup() {
    const router = useRouter();
    const userData = reactive({
      alina_id: '',
      firstname: '',
      email: '',
      alina_config: {
        accent: '',
        gender: '',
        age: ''
      }
    });

    const selectedAccent = ref(null);
    const selectedGender = ref(null);
    const selectedAge = ref(null);

    const accentOptions = [
      { label: 'French', value: 'french' },
      { label: 'English', value: 'english' },
      { label: 'Spanish', value: 'spanish' }
    ];

    const genderOptions = [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' }
    ];

    const ageOptions = [
      { label: 'Young', value: 'young' },
      { label: 'Old', value: 'old' }
    ];

    const feedData = ref([]);
    const userPrompt = ref("");
    const loading = ref(false); // Loading state
    const showSettingsModal = ref(false);
    const settings = reactive({
      alinaId: '',
      password: '',
      email: ''
    });

    onMounted(async () => {
      await fetchUserData();
      await fetchUserAsks();
    });

    const fetchUserData = async () => {
      try {
        const userId = parseInt(localStorage.getItem('userId'), 10); // Replace with actual user ID if necessary
        const userResponse = await getUser(userId);
        Object.assign(userData, userResponse.data);

        const config = JSON.parse(userData.alina_config);
        selectedAccent.value = config.accent;
        selectedGender.value = config.gender;
        selectedAge.value = config.age;
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        router.push('/'); // Redirect to login if error occurs
      }
    };

    const fetchUserAsks = async () => {
      const userId = parseInt(localStorage.getItem('userId'), 10); // Replace with actual user ID if necessary
      console.log(userId)
      try {
        const asksResponse = await getUserAsks(userId);
        console.log(asksResponse)
        feedData.value = asksResponse.data.asks;
      } catch (error) {
        console.error("Failed to fetch asks:", error);
      }
    };

    const submitPrompt = async () => {
      if (!userPrompt.value) return;
      loading.value = true; // Show loading indicator
      try {
        await postAsk({
          prompt: userPrompt.value,
          withVocalAnswer: true,// Adjust if you want this to be dynamic
          voiceGender: selectedGender.value
        });
        userPrompt.value = ""; // Clear input after submission
        await fetchUserAsks(); // Refresh the feed after adding a new ask
      } catch (error) {
        console.error("Failed to submit prompt:", error);
        alert("An error occurred while submitting your prompt.");
      } finally {
        loading.value = false; // Hide loading indicator
      }
    };

    const openSettings = () => {
      showSettingsModal.value = true;
    };

    const closeSettings = () => {
      showSettingsModal.value = false;
    };

    const saveSettings = () => {
      console.log("Settings saved:", settings);
      closeSettings();
    };

    const disconnect = () => {
      localStorage.removeItem('token');
      router.push('/');
    };

    return {
      selectedAccent,
      selectedGender,
      selectedAge,
      accentOptions,
      genderOptions,
      ageOptions,
      feedData,
      userPrompt,
      submitPrompt,
      loading, // Export loading state
      disconnect,
      showSettingsModal,
      openSettings,
      closeSettings,
      saveSettings,
      settings,
      userData
    };
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 17%;
  background-color: #f4f4f9;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.cascader {
  margin-bottom: 15px;
}

.button-group {
  display: flex;
  align-items: center;
  margin-top: auto;
  padding-top: 20px;
}

.content {
  width: 85%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
}

.feed {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.prompt {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-top: 1px solid #ddd;
}

.loading-indicator {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.loading-indicator span {
  margin-left: 5px;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  max-width: 90%;
}
</style>
