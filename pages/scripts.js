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
  DataTable,
  Link,
} from '@shopify/polaris';

import * as ip from { ip };

class ScriptPage extends React.Component {

  constructor() {
    super();
    this.state = {
      script_tags: [],
    }

    this.renderScriptsTable = this.renderScriptsTable.bind(this);
    this.addScript = this.addScript.bind(this);
    this.deleteScript = this.deleteScript.bind(this);
    this.refreshScripts = this.refreshScripts.bind(this);
  }

  renderScriptsTable() {
    const rows = this.state.script_tags.map(s => {
      return [
        s.id, 
        <Link url={s.src}>{s.src}</Link>,
        s.event,
        <Button
          destructive
          size="slim"
          onClick={() => {
            this.deleteScript(s.id);
          }}
        >
          Delete
        </Button>
      ]
    });
      
    return (
      <DataTable
        columnContentTypes = {[
          'text',
          'text',
          'text',
          'text',
        ]}
        headings = {[
          'id',
          'src',
          'event',
          'actions',
        ]}
        rows = { rows }
      />
    )
  }

  render() {
    return (
      <Page>
          <Card
            sectioned script_tags
            title="Script Tags"
            actions={[{content: 'Refresh', onAction: this.refreshScripts}]}
          >
            <p>View Script Tags that are enqueued in your online store.</p>
            { this.renderScriptsTable() }
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
    const endpoint = `/post-scripts`;
    const response = await fetch(endpoint);
    const json = await response.json();
    if (json) this.refreshScripts();
  }
  async deleteScript(id) {
    const endpoint = `/script_tags`;
    const response = await fetch(endpoint, {
      method: 'DELETE',
      body: { id }
    });

    const { success } = await response.json();
    if (success) this.refreshScripts();
  }
  async refreshScripts() {
    const endpoint = `/get-scripts`;
    const response = await fetch(endpoint);
    const { script_tags } = await response.json();
    this.setState({ script_tags })
  }
}

export default ScriptPage;