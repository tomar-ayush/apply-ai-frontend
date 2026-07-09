import { Providers } from "@/app/providers";
import { AppRoutes } from "@/app/routes";
import { Analytics } from '@vercel/analytics/next';

function App() {
  return (
    <>
      <Analytics />
      <Providers>
        <AppRoutes />
      </Providers>
    </>
  );
}

export default App;
