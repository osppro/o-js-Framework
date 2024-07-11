# o-js-Framework
o.js - A lightweight and modular JavaScript framework for building dynamic web applications. Designed with a focus on simplicity, flexibility, and performance.

# o.js - A Lightweight JavaScript Framework

o.js is a minimalist JavaScript framework that empowers developers to build dynamic and responsive web applications with ease. Designed with a focus on simplicity, flexibility, and performance, o.js provides a straightforward approach to component-based development, routing, and data management.

## Features

- **Component-based Architecture**: Easily create and manage reusable UI components with a clear separation of concerns.
- **Efficient Routing**:  Implement client-side routing with a simple and intuitive API, as well as support for server-side rendering (SSR).
- **Data Management**: Manage application-wide data with a centralized data store, and integrate with various backend APIs.
- **Lightweight and Modular**: The core framework is lightweight, allowing you to build applications without unnecessary overhead.
- **Extensible**: Customize and extend the framework to fit your specific needs, including the ability to add custom directives.

## Getting Started

### Installation

Include the `o.js` file in your HTML:

### Usage

```html
<script src="https://cdn.jsdelivr.net/npm/o-js-framework"></script>
Create your first component:
// Create your first component
class HomePage extends OComponent {
  render() {
    this.element.innerHTML = `
      <h1>Welcome to the Home Page</h1>
      <p>This is the content of the home page.</p>
    `;
  }
}

Define your routes and mount the application:
const o = new O();

o.component('home-page', HomePage);
o.route('/', 'home-page');

o.mount();
```
### Server-Side Rendering (SSR)
o.js supports server-side rendering (SSR) for improved initial load times and SEO. You can use the O.renderToString() method to render your components on the server:
```
const html = O.renderToString('home-page', { /* props */ });
// Use the rendered HTML on the server-side
```

### API Integration
o.js provides a convenient O.fetch() method that wraps the native fetch() API, allowing you to integrate with various backend APIs (PHP, Python, Go, etc.):
```const data = await O.fetch('/api/data');
// Use the fetched data in your components
```

### Documentation
For detailed documentation, examples, and more information, please visit the o.js Documentation.

### Contributing
We welcome contributions to the o.js framework! If you have any ideas, bug reports, or pull requests, please feel free to submit them on the GitHub repository.

### License
o.js is released under the  <b>MIT License</b>.
