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
  </div>
</template>

<script>
import { ref } from 'vue';
import Card from '@/components/Card.vue';

export default {
  name: 'Prompt',
  components: {
    Card
  },
  setup() {
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
        audioSrc: '../../backend/decoded_audio.mp3'
      },
      {
        question: 'What is the largest planet?',
        answer: 'The largest planet is Jupiter.',
        audioSrc: 'path/to/audio2.mp3'
      }
      // Add more items as needed
    ]);

    const userPrompt = ref("");

    const submitPrompt = () => {
      console.log("Prompt submitted:", userPrompt.value);
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
      submitPrompt
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
  width: 15%;
  background-color: #f4f4f9;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.cascader {
  margin-bottom: 15px;
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
</style>
