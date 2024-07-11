import { OComponent, ORouter, O } from './o.js';

class HomeComponent extends OComponent {
  template(data) {
    return `
      <h1>\[data.title]</h1>
      <p>\[data.content]</p>
      <a href="#" onclick="o.navigate('/about')">Go to About</a>
    `;
  }
}

class AboutComponent extends OComponent {
  template(data) {
    return `
      <h1>\[data.title]</h1>
      <p>\[data.content]</p>
      <a href="#" onclick="o.navigate('/')">Go to Home</a>
    `;
  }
}

const o = new O('/o-js-Framework');

o.component('HomeComponent', HomeComponent);
o.component('AboutComponent', AboutComponent);

o.route('/', 'HomeComponent');
o.route('/about', 'AboutComponent');
o.setDefaultRoute('HomeComponent');

o.data({
  title: 'Welcome to O.js',
  content: 'This is the home page.'
});

o.mount(() => {
  console.log('Application mounted');
});
