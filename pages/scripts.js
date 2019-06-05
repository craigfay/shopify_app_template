// GET /admin/api/2019-04/script_tags.json

import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import {
  Card,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
} from '@shopify/polaris';
import store from 'store-js'
import { TUNNEL_URL } from "../env.json";

class ScriptPage extends React.Component {
  render() {
    this.makeRequest();
    return <h1>This is the scripts page</h1>
  }
  async makeRequest() {
    const endpoint = `${TUNNEL_URL}/get-scripts`;
    const response = await fetch(endpoint);
    const body = await response.text();
    console.log(body);
  }
}

export default ScriptPage;