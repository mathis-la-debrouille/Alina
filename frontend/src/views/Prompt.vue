<template>
  <div class="page-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <h2>Alina infos</h2>
      <p>ID: 667389263</p>
      <p>Name: Alina de tom</p>
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
          :audioSrc="item.audioSrc"
        />
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
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import Card from '@/components/Card.vue';

export default {
  name: 'Prompt',
  components: {
    Card
  },
  setup() {
    const router = useRouter();

    // Cascader model values
    const selectedAccent = ref(null);
    const selectedGender = ref(null);
    const selectedAge = ref(null);

    // Options for each Cascader
    const accentOptions = [
      { label: 'French', value: 'fr' },
      { label: 'English', value: 'en' },
      { label: 'Spanish', value: 'es' }
    ];

    const genderOptions = [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' }
    ];

    const ageOptions = [
      { label: 'Young', value: 'young' },
      { label: 'Old', value: 'old' }
    ];

    // Feed data for QCards
    const feedData = ref([
      {
        question: 'What is the capital of France?',
        answer: 'The capital of France is Paris.',
        audioSrc: '/Users/mathislaurent/Documents/Perso/Alina/backend/decoded_audio.wav'
      },
      {
        question: 'What is the largest planet?',
        answer: 'The largest planet is Jupiter.',
        audioSrc: 'path/to/audio2.mp3'
      }
    ]);

    const userPrompt = ref("");

    // Settings modal state and data
    const showSettingsModal = ref(false);
    const settings = reactive({
      alinaId: '',
      password: '',
      email: ''
    });

    const submitPrompt = () => {
      console.log("Prompt submitted:", userPrompt.value);
    };

    // Open settings modal
    const openSettings = () => {
      showSettingsModal.value = true;
    };

    // Close settings modal
    const closeSettings = () => {
      showSettingsModal.value = false;
    };

    // Save settings
    const saveSettings = () => {
      console.log("Settings saved:", settings);
      closeSettings();
    };

    // Disconnect handler
    const disconnect = () => {
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
      disconnect,
      showSettingsModal,
      openSettings,
      closeSettings,
      saveSettings,
      settings
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
