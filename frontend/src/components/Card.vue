<!-- src/components/QCard.vue -->
<template>
  <q-collapse model="activeNames" class="card">
    <q-collapse-item :title="question" name="question">
      <p class="answer">{{ answer }}</p>
      <audio controls>
        <source :src="audioSrc" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
-    </q-collapse-item>
  </q-collapse>
</template>

<script>
export default {
  name: 'Card',
  props: {
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    audioSrc: {
      type: String,
      required: true
    }
  }
};
</script>

<style scoped>
.card {
  margin-bottom: 15px;
}

.question {
  font-style: italic;
  color: #333;
  margin-bottom: 8px;
}

.answer {
  color: #555;
  margin-bottom: 12px;
}
</style>
