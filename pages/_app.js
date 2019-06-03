import App from 'next/app';
import Head from 'next/head';
import { AppProvider } from '@shopify/polaris';
import Cookies from 'js-cookie';
import '@shopify/polaris/styles.css';



class MyApp extends App {
  state = {
    shopOrigin: Cookies.get('shopOrigin'),
  };
  
  render() {
    const { Component, pageProps } = this.props;
    return (
      <React.Fragment>
        <Head>
          <title>Sample App</title>
          <meta charSet="utf-8" />
        </Head>
        <AppProvider
          shopOrigin={this.state.shopOrigin}
          apiKey={API_KEY}
          forceRedirect
        ></AppProvider>
      </React.Fragment>
    );
  }
}

export default MyApp;