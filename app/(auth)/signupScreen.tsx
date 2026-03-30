import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { cssInterop } from "nativewind";
import Toast from 'react-native-toast-message';

// Import your Firebase configuration
import { auth, db } from '../../services/firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

cssInterop(LinearGradient, { className: "style" });

export default function RegisterScreen() {
  const router = useRouter();
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Data States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Refs for keyboard "Next" flow
  const emailRef        = useRef<TextInput>(null);
  const phoneRef        = useRef<TextInput>(null);
  const passwordRef     = useRef<TextInput>(null);
  const confirmPassRef  = useRef<TextInput>(null);

  const handleSignUp = async () => {
    if (!fullName || !email || !phone || !password) {
      Toast.show({ type: 'error', text1: 'Missing Info', text2: 'Please fill in all fields to join AlertZone.' });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Password Error', text2: 'Passwords do not match.' });
      setConfirmPassword('');
      return;
    }
    if (!agreeTerms) {
      Toast.show({ type: 'error', text1: 'Terms Required', text2: 'You must agree to the Terms of Services to proceed.' });
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        phoneNumber: phone,
        role: 'citizen', 
        createdAt: new Date().toISOString(),
        uid: user.uid,
        status: 'active',
      });

      console.log("✅ Citizen Registered:", user.email);

      Toast.show({ type: 'success', text1: 'Registration Successful!', text2: 'Please login with your credentials.' });

      setTimeout(() => router.replace("/(auth)/loginScreen"), 1500);

    } catch (error: any) {
      console.error("❌ Firebase Error:", error.code);
      
      let message = "An error occurred during sign up.";
      if (error.code === 'auth/email-already-in-use') message = "This email is already in use.";
      if (error.code === 'auth/invalid-email')        message = "Please enter a valid email address.";
      if (error.code === 'auth/weak-password')        message = "Password should be at least 6 characters.";

      Toast.show({ type: 'error', text1: 'Sign Up Failed', text2: message });

    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D1F2D', '#0A1820', '#071318']} className="flex-1">
      {/*
        ✅ FIX 1: Use behavior="padding" for BOTH platforms.
           "height" on Android doesn't push the content up — it shrinks the
           container, which clips the bottom inputs instead of scrolling to them.
        ✅ FIX 2: keyboardVerticalOffset gives a small buffer on Android so the
           focused input isn't sitting right at the keyboard edge.
      */}
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'android' ? 30 : 0}
        className="flex-1"
      >
        {/*
          ✅ FIX 3: keyboardShouldPersistTaps="handled" — without this, tapping
             the confirm-password field first dismisses the keyboard (needing a
             second tap), and the view never scrolls to reveal it.
          ✅ FIX 4: paddingBottom on contentContainerStyle ensures the last
             inputs are never clipped behind the keyboard even after scrolling.
        */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View className="flex-1 px-8 pt-12 pb-10 justify-center">
            
            <View className="items-center mb-6">
              <Image source={require('../../assets/images/iconAlerZone-Bg-none.png')} className="w-20 h-20" resizeMode="contain" />
              <Text className="text-white text-3xl font-bold mt-4">Create Account</Text>
              <Text className="text-gray-400 mt-1">Get started with AlertZone.</Text>
            </View>

            <View className="space-y-2">
              {/* Full Name */}
              <View className="bg-[#1E3A44] border border-[#2D4F5C] rounded-2xl p-2 flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#30A89C" />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-400 text-[10px] uppercase font-bold">Full Name:</Text>
                  <TextInput
                    placeholder="John Snow"
                    placeholderTextColor="#5A7D8A"
                    className="text-white text-base"
                    style={{ paddingLeft: 0, marginLeft: 0 }}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              {/* Email */}
              <View className="bg-[#1E3A44] border border-[#2D4F5C] rounded-2xl p-2 flex-row items-center mt-3">
                <Ionicons name="mail-outline" size={20} color="#30A89C" />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-400 text-[10px] uppercase font-bold">E-mail:</Text>
                  <TextInput
                    ref={emailRef}
                    placeholder="john@email.com"
                    placeholderTextColor="#5A7D8A"
                    className="text-white text-base"
                    style={{ paddingLeft: 0, marginLeft: 0 }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => phoneRef.current?.focus()}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Phone */}
              <View className="bg-[#1E3A44] border border-[#2D4F5C] rounded-2xl p-2 flex-row items-center mt-3">
                <Ionicons name="call-outline" size={20} color="#30A89C" />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-400 text-[10px] uppercase font-bold">Phone Number:</Text>
                  <TextInput
                    ref={phoneRef}
                    placeholder="+94 7X XXX XXXX"
                    placeholderTextColor="#5A7D8A"
                    className="text-white text-base"
                    style={{ paddingLeft: 0, marginLeft: 0 }}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>

              {/* Password */}
              <View className="bg-[#1E3A44] border border-[#2D4F5C] rounded-2xl p-2 flex-row items-center mt-3">
                <Ionicons name="lock-closed-outline" size={20} color="#30A89C" />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-400 text-[10px] uppercase font-bold">Password:</Text>
                  <TextInput
                    ref={passwordRef}
                    placeholder="••••••••••••"
                    placeholderTextColor="#5A7D8A"
                    className="text-white text-base"
                    style={{ paddingLeft: 0, marginLeft: 0 }}
                    secureTextEntry={!showPassword}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPassRef.current?.focus()}
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#30A89C" />
                </Pressable>
              </View>

              {/* Confirm Password */}
              <View className="bg-[#1E3A44] border border-[#2D4F5C] rounded-2xl p-2 flex-row items-center mt-3">
                <Ionicons name="lock-closed-outline" size={20} color="#30A89C" />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-400 text-[10px] uppercase font-bold">Confirm Password:</Text>
                  <TextInput
                    ref={confirmPassRef}
                    placeholder="••••••••••••"
                    placeholderTextColor="#5A7D8A"
                    className="text-white text-base"
                    style={{ paddingLeft: 0, marginLeft: 0 }}
                    secureTextEntry={!showConfirmPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleSignUp}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#30A89C" />
                </Pressable>
              </View>
            </View>

            {/* Terms */}
            <View className="flex-row items-center mt-4 px-1">
              <Pressable
                className={`w-5 h-5 rounded border ${agreeTerms ? 'bg-[#30A89C] border-[#30A89C]' : 'border-gray-500'} items-center justify-center`}
                onPress={() => setAgreeTerms(!agreeTerms)}
              >
                {agreeTerms && <Ionicons name="checkmark" size={14} color="white" />}
              </Pressable>
              <Text className="text-gray-400 ml-2 text-sm">
                I agree to the <Text className="text-[#30A89C] font-bold">Terms of Services</Text>
              </Text>
            </View>

            {/* Buttons */}
            <View className="mt-6">
              <Pressable
                className={`p-4 rounded-full shadow-lg items-center ${loading ? 'bg-[#4CC2D1]/50' : 'bg-[#4CC2D1]'}`}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#122D36" /> : <Text className="text-[#122D36] text-center font-bold text-lg">Sign Up</Text>}
              </Pressable>

              <Text className="text-gray-500 text-center my-4">or sign up with</Text>

              <Pressable className="bg-[#1E3A44] border border-[#2D4F5C] p-4 rounded-2xl flex-row justify-center items-center active:opacity-80">
                <Ionicons name="logo-google" size={20} color="white" />
                <Text className="text-white font-semibold ml-3">Continue with Google</Text>
              </Pressable>
            </View>

            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-400">Already have an account? </Text>
              <Pressable onPress={() => router.push("/(auth)/loginScreen")} className='active:opacity-70'>
                <Text className="text-[#4CC2D1] font-bold">Log In</Text>
              </Pressable>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}