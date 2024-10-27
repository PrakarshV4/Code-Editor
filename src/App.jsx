import EditorPage from "./pages/EditorPage";
import HomePage from "./pages/HomePage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "../src/App.css";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <div>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              theme: {
                primary: "#4aed88",
              },
            },
          }}
        ></Toaster>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path={"/"} element={<HomePage />} />
          <Route path={"/editor/:roomId"} element={<EditorPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;