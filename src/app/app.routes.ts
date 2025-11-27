import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'x',
    loadComponent: () =>
      import('./pages/page-loader/page-loader.component').then(
        (m) => m.PageLoaderComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Home',
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
    title: 'About',
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(
        (m) => m.ContactComponent
      ),
    title: 'Contact',
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./pages/blog/blog.component').then((m) => m.BlogComponent),
    title: 'Blogs',
  },
  // write here blog details
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./pages/blog-details/blog-details.component').then(
        (m) => m.BlogDetailsComponent
      ),
    title: 'Blog Details',
  },
  {
    path: 'tour',
    loadComponent: () =>
      import('./pages/tour/tour.component').then((m) => m.TourComponent),
    title: 'Tours',
  },
  // write here tour details
  {
    path: 'tour/:slug',
    loadComponent: () =>
      import('./pages/tour-details/tour-details.component').then(
        (m) => m.TourDetailsComponent
      ),
    title: 'Tour Details',
  },
  {
    path: 'destination',
    loadComponent: () =>
      import('./pages/destination/destination.component').then(
        (m) => m.DestinationComponent
      ),
    title: 'Destinations',
  },
  //   // write here destinations details
  {
    path: 'destination/:slug',
    loadComponent: () =>
      import('./pages/destination-details/destination-details.component').then(
        (m) => m.DestinationDetailsComponent
      ),
    title: 'Destinations Details',
  },

  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.component').then(
        (m) => m.CheckoutComponent
      ),
    title: 'Checkout',
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart.component').then((m) => m.CartComponent),
    title: 'Cart',
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
    title: 'Log In',
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup.component').then((m) => m.SignupComponent),
    title: 'Sign Up',
  },
  {
    path: 'forgetPassword',
    loadComponent: () =>
      import('./pages/forget-password/forget-password.component').then(
        (m) => m.ForgetPasswordComponent
      ),
    title: 'Forget Password',
  },
  {
    path: 'faq',
    loadComponent: () =>
      import('./pages/faq/faq.component').then((m) => m.FaqComponent),
    title: 'FAQs',
  },
  {
    path: 'makeTrip',
    loadComponent: () =>
      import('./pages/make-trip/make-trip.component').then(
        (m) => m.MakeTripComponent
      ),
    title: 'Make Your Trip',
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    title: 'My Account',
  },

  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
    title: 'Page Not Found',
  },
];
