{ pkgs ? import <nixpkgs> {} }:

let
  deps = with pkgs; [
    nodejs_20
    corepack_20
    nodePackages.typescript-language-server
    libuuid
  ];
in
pkgs.mkShell {
  buildInputs = deps;
  shellHook = ''
    export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath [pkgs.libuuid]}
  '';
}