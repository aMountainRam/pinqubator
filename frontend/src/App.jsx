import {BrowserRouter as Router, Route} from "react-router-dom";
import SearchPage from "./SearchPage";

function App() {
  return (
    <Router>
      <Route exact path="/" component={SearchPage}/>
    </Router>
  );
}

export default App;
