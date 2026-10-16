import { ProfileHeader, profileStyles as shared } from '@/components/profile-ui';
import { Colors, Fonts } from '@/constants/theme';
import { restaurantReviews } from '@/data/restaurant-dashboard';
import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const portraits=[require('../../../assets/images/profile-user.png'),require('../../../assets/images/courier-robert.png')];
export default function RestaurantReviewsScreen(){return <SafeAreaView style={shared.screen}><ProfileHeader title="Reviews" /><ScrollView contentContainerStyle={styles.content}>{restaurantReviews.map((review,index)=><View key={review.id} style={styles.row}><Image source={portraits[index%portraits.length]} style={styles.avatar} /><View style={styles.card}><Text style={styles.date}>{review.name}</Text><Text style={styles.title}>{review.rating===5?'Great Food and Service':'Awesome and Nice'}</Text><View style={styles.stars}>{Array.from({length:5},(_,i)=><Ionicons key={i} name={i<review.rating?'star':'star-outline'} color={Colors.primary} size={15} />)}</View><Text style={styles.comment}>{review.comment}</Text></View></View>)}</ScrollView></SafeAreaView>;}
const styles=StyleSheet.create({content:{paddingHorizontal:24,paddingBottom:24,gap:20},row:{flexDirection:'row',alignItems:'flex-start',gap:12},avatar:{width:40,height:40,borderRadius:20},card:{flex:1,backgroundColor:'#F5F7FA',borderRadius:16,padding:16,gap:8},date:{fontFamily:Fonts.regular,color:Colors.textSecondary,fontSize:11},title:{fontFamily:Fonts.bold,color:Colors.text,fontSize:14},stars:{flexDirection:'row',gap:3},comment:{fontFamily:Fonts.regular,color:Colors.textSecondary,fontSize:12,lineHeight:19}});
