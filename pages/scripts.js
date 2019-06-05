import {
  Page,
  Card,
  Form,
  Layout,
  FormLayout,
  TextField,
  Button,
  ResourceList,
  TextStyle,
} from '@shopify/polaris';
import store from 'store-js'
import { TUNNEL_URL } from "../env.json";

class ScriptPage extends React.Component {
  state = {}
  render() {
    return (
      <Page>
          <Card
            sectioned 
            title="Script Tags"
            actions={[{content: 'Refresh', onAction: this.refreshScripts}]}
          >
            <p>View Script Tags that are enqueued in your online store.</p>
          </Card>

          <Card sectioned>
            <Form
              onSubmit={this.addScript}
              name="Add Script"
            >
              <FormLayout>
                <TextField
                  label="Source"
                  helpText="The URL of the script tag you'd like to add"
                  onChange={(value) => this.setState({value})}
                />
                <Button submit>Add</Button>
                </FormLayout>
            </Form>
          </Card>
      </Page>
    )
  }
  async addScript(event) {
    console.log(event)
  }
  async refreshScripts() {
    const endpoint = `${TUNNEL_URL}/get-scripts`;
    const response = await fetch(endpoint);
    const body = await response.text();
    console.log(body);
  }
}

export default ScriptPage;