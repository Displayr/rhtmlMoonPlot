{ pkgs ? import <nixpkgs> {}, displayrUtils }:

pkgs.rPackages.buildRPackage {
  name = "rhtmlMoonPlot";
  version = displayrUtils.extractRVersion (builtins.readFile ./DESCRIPTION); 
  src = ./.;
  description = ''An opinionated template for the creation of html widget repositories using ES6'';
  propagatedBuildInputs = with pkgs.rPackages; [ 
    htmlwidgets
  ];
}
