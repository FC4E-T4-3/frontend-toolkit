import React from 'react';
import { useState } from 'react';
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
import {
  Configure,
  Hits,
  InstantSearch,
  Pagination,
  SearchBox,
  RefinementList,
  Stats,
  CurrentRefinements
} from 'react-instantsearch-hooks-web';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import Badge from 'react-bootstrap/Badge';
import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Collapse from 'react-bootstrap/Collapse';
import type { Hit } from 'instantsearch.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { JsonView, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
 

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: "xyz", // Be sure to use the search-only-api-key
    nodes: [
      {
        host: "141.5.103.83",
        port: 8108,
        protocol: "http"
      }
    ]
  },
  // The following parameters are directly passed to Typesense's search API endpoint.
  //  So you can pass any parameters supported by the search endpoint below.
  //  queryBy is required.
  additionalSearchParameters: {
    query_by: "name,authors,desc",
    infix: 'always'
  }
});
const searchClient = typesenseInstantsearchAdapter.searchClient;


export function App() {

  return (
    <div>
      <header className="header">
        <h1 className="header-title">
          <a href="/">frontend-toolkit</a>
        </h1>
        <p className="header-subtitle">
          using{' '}
          <a href="https://github.com/algolia/instantsearch/tree/master/packages/react-instantsearch-hooks-web">
            React InstantSearch Hooks
          </a>
        </p>
      </header>

      <div className="container">
        <InstantSearch searchClient={searchClient} indexName="types" >
          <Configure hitsPerPage={8} />
          <div id='wrapper'>
            <div id='facets' style={{float:'left'}}>
            <ListGroup>
              <ListGroup.Item><b>Origin</b> <hr/><RefinementList attribute="origin"/></ListGroup.Item>
              <ListGroup.Item><b>Author</b> <hr/><RefinementList attribute="authors" showMore={true} searchable={true}/></ListGroup.Item>
              <ListGroup.Item><b>Type</b> <hr/><RefinementList attribute="type"/></ListGroup.Item>
            </ListGroup>
            </div>
          <div className="search-panel" id='search'>
            <div className="search-panel__filters">
            </div>
              <div className="search-panel__results">
                <Stats/> <br/>
                <SearchBox placeholder="" className="searchbox" />
                <CurrentRefinements/> <br/>
                <Hits hitComponent={Hit} />

                <div className="pagination">
                  <Pagination />
                </div>
              </div>
            </div>
          </div>
        </InstantSearch>
      </div>
    </div>
  );
}

type HitProps = {
  hit: Hit;
};

const getDescription = async (pid) => {
  console.log(pid);
  let data = await fetch('http://141.5.103.83/v1/desc/'+pid);
  let dataJson = await data.json();
  return dataJson;
}

const getValidation = async (pid) => {
  console.log(pid);
  let data = await fetch('http://141.5.103.83/v1/validation/'+pid);
  let dataJson = await data.json();
  return dataJson;
}


function Hit({ hit }: HitProps) {
  const [open, setOpen] = useState(false);

  const [json, setJson] = useState("");
  
  const description = async () => {
    let json = await getDescription(hit.id);
    setJson(json);
  }

  const validation = async () => {
    let json = await getValidation(hit.id);
    setJson(json);
  }

  let name = hit._highlightResult.name.value;
  let desc = hit._highlightResult.desc.value;
  let authors = hit._highlightResult.authors.map((a) => a.value).join(', ');

  const theme = {
    scheme: 'ashes',
    author: 'jannik siebert (https://github.com/janniks)',
    base00: '#1C2023',
    base01: '#393F45',
    base02: '#565E65',
    base03: '#747C84',
    base04: '#ADB3BA',
    base05: '#C7CCD1',
    base06: '#DFE2E5',
    base07: '#F3F4F5',
    base08: '#C7AE95',
    base09: '#C7C795',
    base0A: '#AEC795',
    base0B: '#95C7AE',
    base0C: '#95AEC7',
    base0D: '#AE95C7',
    base0E: '#C795AE',
    base0F: '#C79595'
  };

  return (
    <article>
      <Stack direction='horizontal' gap={2}>  
        <h5 style={{display:'inline'}} dangerouslySetInnerHTML={{__html: name}}></h5>
        <h6 style={{display:'inline'}}><Badge>{hit.type}</Badge></h6>
      </Stack>

      <Table>
      <tbody>
        <tr>
          <td>Identifier</td>
          <td>{hit.id}</td>
        </tr>
        <tr>
          <td>Type</td>
          <td>{hit.type}</td>
        </tr>
        <tr>
          <td>Origin</td>
          <td>{hit.origin}</td>
        </tr>
        <tr>
          <td>Authors</td>
          <td dangerouslySetInnerHTML={{__html: authors}}></td>
        </tr>
        <tr>
          <td style={{width:150}}>Creation Date</td>
          <td>{hit.date}</td>
        </tr>
        <tr>
          <td>Description</td>
          <td dangerouslySetInnerHTML={{__html: desc}}></td>
        </tr>
      </tbody>
    </Table>
      <Button onClick={()=>setOpen(!open)}
      aria-controls='typeFunctions'
      aria-expanded={open}>Details
      </Button>
      <Collapse in={open}>
        <div id="typeFunctions">
          <hr/>
          <Stack direction='horizontal' gap={2}>  
            <Button onClick={() => description()} variant="light">JSON Description</Button>
            <Button onClick={() => validation()} variant="light">Validation Schema</Button>
            <Button variant="light" >Go to source</Button>
          </Stack>
          <br/>
        <React.Fragment>
          <Card id="jsonHit">
            <JsonView data={json} shouldInitiallyExpand={(level) => true} style={defaultStyles}/>
          </Card>
        </React.Fragment>
        </div>
      </Collapse>
    </article>
  );
}
