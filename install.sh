#!/bin/sh
# set -x
systemctl link $(pwd)/thunderdove.service

cp thunderdove.nginx.conf /etc/nginx/sites-available/thunderdove

echo -n user
read -p : user
echo inserting $user
echo -n "$user:" >> .htpasswd
openssl passwd -apr1 >> .htpasswd
