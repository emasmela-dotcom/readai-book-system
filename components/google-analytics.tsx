const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-RG96PMWRL0'

export function GoogleAnalytics() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');
(function () {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=${gaId}';
  document.head.appendChild(s);
})();
        `.trim(),
      }}
    ></script>
  )
}
