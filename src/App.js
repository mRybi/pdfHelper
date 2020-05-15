import React from "react";
import InsertIntoPDFView from './view/InsertIntoPDFView';
import PDFMergeView from './view/PDFMergeView';
import { Switch,BrowserRouter, Route } from 'react-router-dom';
import { Nav } from './components/Nav/Nav';
import './App.css';



function App() {
  return (
    <BrowserRouter>
      <Nav/>
      <Switch>
        <Route path="/pdfHelper/" exact={true} component={InsertIntoPDFView} />
        <Route path="/pdfHelper/merge" exact={true} component={PDFMergeView} />
      </Switch>
    </BrowserRouter>
  );
}


export default App;
