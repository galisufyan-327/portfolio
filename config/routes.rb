Rails.application.routes.draw do
  root 'pages#home'
  resources :contacts, only: [:create]

  namespace :admin do
    root 'portfolio_items#index'
    resources :portfolio_items
  end
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  # Serve websocket cable requests in-process
  # mount ActionCable.server => '/cable'
end
