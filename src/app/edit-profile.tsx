import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ButtonContent } from '@/components/button-content';
import { ProfileHeader, profileStyles as shared, useProfile } from '@/components/profile-ui';
import { Colors, Fonts } from '@/constants/theme';
import { getSupabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function EditProfileScreen() {
  const profile = useProfile();
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [picking, setPicking] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [bio, setBio] = useState(profile.bio);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const choosePhoto = async () => {
    if (busy || picking) return;
    setPicking(true); setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (!asset.base64) throw new Error('Could not read this photo. Please choose another image.');
        if (asset.base64.length * 0.75 > 5 * 1024 * 1024) throw new Error('Choose a photo smaller than 5 MB.');
        setPhoto(asset);
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not open your photos.'); }
    finally { setPicking(false); }
  };
  const save = async () => {
    if (busy) return;
    setBusy(true); setError(null);
    let uploadedPath: string | null = null;
    try {
      if (!name.trim()) throw new Error('Enter your full name.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('Enter a valid email.');
      const changedEmail = email.trim().toLowerCase() !== profile.email.toLowerCase();
      let avatarUrl: string | undefined;
      if (photo?.base64) {
        const client = getSupabase();
        const user = await client.auth.getUser();
        if (user.error || !user.data.user) throw new Error('Please sign in again.');
        const bytes = Uint8Array.from(atob(photo.base64), character => character.charCodeAt(0));
        const png = bytes[0] === 137 && bytes[1] === 80;
        const webp = bytes[0] === 82 && bytes[8] === 87;
        const type = png ? 'image/png' : webp ? 'image/webp' : 'image/jpeg';
        const path = user.data.user.id + '/' + Date.now() + (png ? '.png' : webp ? '.webp' : '.jpg');
        const upload = await client.storage.from('profile-avatars').upload(path, bytes.buffer, { contentType: type, upsert: false });
        if (upload.error) throw new Error('Could not upload your photo. Check that the profile-avatars storage migration has been applied.');
        uploadedPath = path;
        avatarUrl = client.storage.from('profile-avatars').getPublicUrl(path).data.publicUrl;
      }
      const result = await getSupabase().auth.updateUser({ ...(changedEmail ? { email: email.trim().toLowerCase() } : {}), data: { ...(avatarUrl ? { avatar_url: avatarUrl } : {}), full_name: name.trim(), contact_phone: phone.trim(), bio: bio.trim() } });
      if (result.error) throw result.error;
      if (changedEmail) setNotice('Profile saved. Check your email to confirm the new email address.'); else router.back();
    } catch (cause) { if (uploadedPath) await getSupabase().storage.from('profile-avatars').remove([uploadedPath]); setError(cause instanceof Error ? cause.message : 'Could not save your profile.'); }
    finally { setBusy(false); }
  };
  return <SafeAreaView style={shared.screen}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><ProfileHeader title="Edit Profile" /><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={shared.content}><View style={styles.photoWrapper}><Image source={photo ? { uri: photo.uri } : profile.avatar} style={styles.photo} /><Pressable accessibilityRole="button" accessibilityLabel="Change profile picture" disabled={busy || picking} onPress={() => void choosePhoto()} style={styles.photoEdit}><Ionicons name="pencil" size={18} color={Colors.white} /></Pressable></View>{([{ label: 'FULL NAME', value: name, change: setName, keyboard: 'default', limit: 80 }, { label: 'EMAIL', value: email, change: setEmail, keyboard: 'email-address', limit: 254 }, { label: 'PHONE NUMBER', value: phone, change: setPhone, keyboard: 'phone-pad', limit: 30 }, { label: 'BIO', value: bio, change: setBio, keyboard: 'default', limit: 200 }] as const).map(field => <View key={field.label}><Text style={styles.label}>{field.label}</Text><TextInput accessibilityLabel={field.label} value={field.value} onChangeText={field.change} keyboardType={field.keyboard} autoCapitalize={field.label === 'EMAIL' ? 'none' : 'sentences'} maxLength={field.limit} multiline={field.label === 'BIO'} numberOfLines={field.label === 'BIO' ? 4 : 1} textAlignVertical={field.label === 'BIO' ? 'top' : 'center'} editable={!busy} style={[styles.input, field.label === 'BIO' && styles.bioInput]} /></View>)}{error && <Text accessibilityRole="alert" style={shared.error}>{error}</Text>}{notice && <Text style={shared.bio}>{notice}</Text>}</ScrollView><View style={shared.bottom}><Pressable accessibilityRole="button" disabled={busy || picking} onPress={() => void save()} style={shared.button}><ButtonContent busy={busy}><Text style={shared.buttonText}>SAVE</Text></ButtonContent></Pressable></View></KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({ photoWrapper: { alignSelf: 'center', width: 120, height: 120, marginBottom: 32 }, photoEdit: { position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, borderWidth: 2, borderColor: Colors.white, alignItems: 'center', justifyContent: 'center' }, bioInput: { height: 120, paddingTop: 14, paddingBottom: 14, lineHeight: 22, textAlignVertical: 'top' }, photo: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center' }, label: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.text, marginBottom: 12 }, input: { backgroundColor: Colors.surfaceSecondary, borderRadius: 10, padding: 18, marginBottom: 24, fontFamily: Fonts.regular, fontSize: 14, color: Colors.text } });
