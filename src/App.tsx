import "./App.css";
import { RouterProvider } from "react-router-dom";
import router from "@/router";
import { Suspense } from "react";

function App() {
  return (
    <Suspense>
      <div className="wrapper">
        <RouterProvider router={router} />
      </div>
    </Suspense>
  );
}

export default App;
