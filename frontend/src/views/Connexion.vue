<template>
  <div class="connexion-container">
    <div>
      <h1>Connect to access Alina</h1>
    </div>
    <q-form ref="form" :model="formModel" :rules="rules">
      <q-form-item label="Email" prop="email">
        <q-input v-model="formModel.email" type="text" />
      </q-form-item>

      <q-form-item label="Password" prop="password">
        <q-input v-model="formModel.password" type="password" />
      </q-form-item>

      <q-button @click="handleSubmitClick">Login</q-button>
      <q-button @click="redirectToSignUp" theme="secondary">Sign up</q-button>
    </q-form>

    <!-- Error Popup for Login -->
    <div v-if="isLoginError" class="error-popup">
      <p>{{ loginErrorMessage }}</p>
      <q-button @click="isLoginError = false" theme="secondary">Close</q-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/apiService';

type FormType = {
  validate: () => Promise<boolean>;
};

export default defineComponent({
  name: 'Connexion',
  setup() {
    const form = ref<FormType | null>(null);
    const formModel = reactive({
      email: '',
      password: ''
    });

    const loginErrorMessages = [
      "Vos identifiants sont incorrects",
      "Un champ est manquant"
    ];

    const loginErrorMessage = ref(""); // Reactive variable for the error message
    const isLoginError = ref(false); // Trigger for displaying the error modal
    const router = useRouter();

    const handleSubmitClick = async () => {
      const valid = await form.value?.validate();
      if (valid) {
        try {
          const response = await login(formModel);
          console.log("LOG", response)
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userId', response.data.id.toString())
          alert('Login successful');
          router.push('/prompt'); // Redirect to home or dashboard
        } catch (error) {
          if (isAxiosError(error) && error.response?.status) {
            // Set error message based on status
            if (error.response.status === 400) {
              loginErrorMessage.value = loginErrorMessages[1];
            } else if (error.response.status === 401) {
              loginErrorMessage.value = loginErrorMessages[0];
            }
            isLoginError.value = true; // Trigger the error popup
          } else {
            console.error(error); // Handle other errors here
          }
        }
      }
    };

    // Helper type guard function to check if `error` is an AxiosError
    function isAxiosError(error: unknown): error is { response: { status: number } } {
      return typeof error === 'object' && error !== null && 'response' in error;
    }

    const redirectToSignUp = () => {
      router.push('/sign-up');
    };

    return {
      form,
      formModel,
      handleSubmitClick,
      redirectToSignUp,
      isLoginError,
      loginErrorMessage
    };
  }
});
</script>

<style scoped>
.connexion-container {
  width: 30%;
  margin: 10% auto 0;
}

.error-popup {
  padding: 20px;
  text-align: center;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  margin-top: 10px;
}
</style>
