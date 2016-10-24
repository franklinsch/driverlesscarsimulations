set :applicatoin, "Autonomous Vehicle Simulation"
set :repository, "git@github.com:franklinsch/driverlesscarsimulations.git"
set :deploy_to, "./deploy"
set :scm, :git
set :use_sudo, false
set :rails_env, "production"
set :ssh_options, {:keys => "./SAVN.pem", :forward_agent => true}

server "35.160.255.102", roles: [:app, :web, :db], :primary => true, :user => "ubuntu"

set :current_path, "./webserver"

namespace :deploy do 
  desc "install node_modules"
  task :install_node_modules do
    execute :npm, 'install', '-s'
  end
  
  desc "run development server"
  task :run_dev_server do
    execute :npm, 'run', 'dev'
  end
end

after "deploy", "deploy:install_node_modules"
after "deploy", "deploy:run_dev_server"
