<template>
  <div class="signup-container">
    <h1>Sign Up</h1>
    
    <q-form ref="form" :model="formModel" :rules="rules">
      <q-form-item label="First Name" prop="firstName">
        <q-input v-model="formModel.firstName" placeholder="Enter your first name" />
      </q-form-item>

      <q-form-item label="Email" prop="email">
        <q-input v-model="formModel.email" type="email" placeholder="Enter your email" />
      </q-form-item>

      <q-form-item label="Password" prop="password">
        <q-input v-model="formModel.password" type="password" placeholder="Enter your password" />
      </q-form-item>

      <q-form-item label="Alina ID" prop="alinaId">
        <div class="alina-id-input">
          <q-input v-model="formModel.alinaId" placeholder="Enter your Alina ID" />
          <q-popover placement="right-end" title="Where is my alina ID ?">
            <template #reference>
              <q-button circle type="icon" theme="secondary" size="medium" icon="q-icon-question-mark" class="info-button" />
            </template>
            <p class="popover-text">You can find your Alina ID by following the installation tutorial.</p>
          </q-popover>
        </div>
      </q-form-item>

      <div class="button-group">
        <q-button @click="handleSubmit">Sign Up</q-button>
        <q-button @click="handleReset" theme="secondary">Reset</q-button>
        <q-button theme="link" @click="redirectToLogin">Login</q-button>
      </div>
    </q-form>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'SignupPage',
  setup() {
    const form = ref(null);
    const router = useRouter();

    // Define the form model
    const formModel = reactive({
      firstName: '',
      email: '',
      password: '',
      alinaId: ''
    });

    // Define form validation rules
    const rules = reactive({
      firstName: { required: true, message: 'First name is required', trigger: 'blur' },
      email: { required: true, type: 'email', message: 'Valid email is required', trigger: 'blur' },
      password: { required: true, min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' },
      alinaId: { required: true, message: 'Alina ID is required', trigger: 'blur' }
    });

    // Submit form handler
    const handleSubmit = async () => {
      const valid = await form.value.validate();
      if (valid) {
        console.log('Form submitted successfully:', formModel);
        alert('Signup successful');
      } else {
        console.log('Validation failed');
      }
    };

    // Reset form handler
    const handleReset = () => {
      form.value.resetFields();
    };

    // Redirect to login page
    const redirectToLogin = () => {
      router.push('/');
    };

    return {
      form,
      formModel,
      rules,
      handleSubmit,
      handleReset,
      redirectToLogin
    };
  }
};
</script>


<style scoped>
.signup-container {
  width: 40%;
  margin: 0 auto;
  margin-top: 9%;
}

.alina-id-input {
  display: flex;
  align-items: center;
}

.info-button {
  margin-left: 8px;
}
</style>
