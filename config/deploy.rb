set :applicatoin, "SAVN"
set :repo_url, "git@github.com:franklinsch/driverlesscarsimulations.git"
set :use_sudo, false
set :rails_env, "production"
set :ssh_options, {:forward_agent => true}

server ENV["SERVER_IP"], roles: [:app, :web, :db], :primary => true, :user => "circleci"

namespace :deploy do 
  desc "install node_modules"
  task :install_node_modules do
    on roles (:app) do
      execute "cd '#{release_path}'; cd webserver; npm install"
    end
  end
  
  desc "start server"
  task :start_server do
    on roles (:app) do
      execute "cd '#{release_path}'; cd webserver; forever stopall; forever start server.js"
    end
  end
end

after "deploy", "deploy:install_node_modules"
after "deploy", "deploy:restart_server"
