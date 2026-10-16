import { trackingHtml } from '@/lib/tracking-map';
export default function TrackingMap() {
  return <iframe title="Order route preview" srcDoc={trackingHtml} sandbox="allow-scripts" style={{ width: '100%', height: '100%', border: 0 }} />;
}
