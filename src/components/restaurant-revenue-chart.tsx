import { InteractivePressable as Pressable } from '@/components/interactive-pressable';
import { Colors } from '@/constants/theme';
import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';

export function RestaurantRevenueChart({ values, labels }: { values: number[]; labels: string[] }) {
  const [selected, setSelected] = useState(2);
  const index = Math.min(selected, values.length - 1);
  const maximum = Math.max(...values, 1);
  const points = values.map((value, i) => ({ x: 12 + i * (296 / Math.max(1, values.length - 1)), y: 106 - value / maximum * 64 }));
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) { const a = points[i - 1], b = points[i], middle = (a.x + b.x) / 2; path += ` C ${middle} ${a.y}, ${middle} ${b.y}, ${b.x} ${b.y}`; }
  const current = points[index];
  const tooltipX = Math.max(0, Math.min(260, current.x - 30));
  return <View><Svg width="100%" height={150} viewBox="0 0 320 150"><Defs><LinearGradient id="revenueFade" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={Colors.primary} stopOpacity={0.2} /><Stop offset="1" stopColor={Colors.primary} stopOpacity={0} /></LinearGradient></Defs><Path d={`${path} L 308 125 L 12 125 Z`} fill="url(#revenueFade)" /><Path d={path} fill="none" stroke={Colors.primary} strokeWidth={2.5} /><Line x1={current.x} x2={current.x} y1={current.y} y2={126} stroke={Colors.primary} strokeOpacity={0.4} /><Circle cx={current.x} cy={current.y} r={4} fill={Colors.white} stroke={Colors.primary} strokeWidth={2} /><Rect x={tooltipX} y={Math.max(0, current.y - 39)} width={60} height={28} rx={5} fill={Colors.text} /><SvgText x={tooltipX + 30} y={Math.max(0, current.y - 39) + 18} textAnchor="middle" fill={Colors.white} fontSize={12}>${values[index]}</SvgText>{labels.map((label, i) => <SvgText key={i} x={points[i].x} y={145} textAnchor="middle" fill={Colors.imagePlaceholder} fontSize={8}>{label}</SvgText>)}</Svg><View style={{ position: 'absolute', inset: 0, flexDirection: 'row' }}>{values.map((value, i) => <Pressable key={i} accessibilityRole="button" accessibilityLabel={`${labels[i]} revenue ${value} dollars`} accessibilityState={{ selected: index === i }} onPress={() => setSelected(i)} style={{ flex: 1 }} />)}</View></View>;
}
