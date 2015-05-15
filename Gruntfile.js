"use strict";
module.exports = function(grunt) {

  // ----------------------------------------------------------
  // WARNING, BRAVE DEVELOPER
  // ----------------------------------------------------------
  // Webhook allows you to use local grunt tasks and files.
  // However, these tasks are ONLY RUN LOCALLY and not when
  // your live site needs to be rebuilt. This means you should
  // only use grunt for pre-processing tasks like building
  // Sass, less or coffescript files, not for reading things
  // from your templates and making dynamic changes during
  // the build process. Doing so will cause your live site
  // not to regenerate.
  //
  // You have been warned!
  var id        = grunt.option('location_id') || null;
  var settings  = grunt.option('settings') || null;

  grunt.initConfig({
    location_id: id,
    settings: settings,

    key: "5de15aee-b49a-41af-95cd-ae49db5b9182",
    curl: {
      getdata: {
        src: {
          url: "https://cms.inlink.com.au/feeds/locations/<%=location_id%>.xml",
          proxy: "http://localhost:8080/"
        },
        dest: ".tmp/location.xml"
      }
    },
    convert: {
      options: {
        explicitArray: false,
      },
      xml2json: {
          files: [
            {
              expand: true,
              cwd: ".tmp/",
              src: ["location.xml"],
              dest: ".tmp/",
              ext: ".json"
            },
            {
              expand: true,
              src: [settings],
              flatten: true,
              dest: ".tmp/",
              ext: "settings.json"
            }
          ]
      },
    }
  });

  grunt.guid = function(){
    var e={};var t=[];
    for(var n=0; n<256; n++){
      t[n]=(n<16 ? "0" : "") + n.toString(16)
    }
    var e=Math.random()*4294967295|0;
    var n=Math.random()*4294967295|0;
    var r=Math.random()*4294967295|0;
    var i=Math.random()*4294967295|0;
    return t[e&255]+t[e>>8&255]+t[e>>16&255]+t[e>>24&255]+"-"+t[n&255]+t[n>>8&255]+"-"+t[n>>16&15|64]+t[n>>24&255]+"-"+t[r&63|128]+t[r>>8&255]+"-"+t[r>>16&255]+t[r>>24&255]+t[i&255]+t[i>>8&255]+t[i>>16&255]+t[i>>24&255];
  };

  grunt.randomString = function(len, charSet) {
    charSet = charSet || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var randomString = "";
    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
  };

  var convert = new Object();
  convert.generic = function(data, multiple, name){
    data._sort_create_date  = Date.now();
    data._sort_last_updated = Date.now();
    data._sort_publish_date = Date.now();
    data.create_date        = new Date().toISOString();
    data.last_updated       = new Date().toISOString();
    data.preview_url        = grunt.guid();
    if (multiple){
      data.publish_date     = new Date().toISOString();
      data.isDraft          = false;
    }
    if (name){
      data.name             = grunt.randomString(8);
    }
    return data;
  };

  convert.location = function(data, location){
    data = convert.generic(new Object(), false, false);
    data.name = location.name;
    data.web_name = location["web-name"];
    data.idx = location.id;
    return data;
  };

  convert.building = function(data, location){
    data = convert.generic(new Object(), false, true);
    var building = location["about-building"];
    data.address = building.address;
    data.building_image_url = building["building-image-url"];
    data.description = building.description;
    return data;
  };

  convert.contacts = function(data, location){
    var contacts = location["contact-items"]["contact-item"];
    if (!(contacts instanceof Array)){
      contacts = [contacts];
    }
    for (var contact in contacts){
      var key   = contact+grunt.randomString(7);
      data[key] = convert.generic(new Object(), true, true);
      data[key].email       = contacts[contact].email;
      data[key].first_name  = contacts[contact]["first-name"];
      data[key].last_name   = contacts[contact]["last-name"];
      data[key].position    = contacts[contact].position;
      data[key].phone       = contacts[contact].phone;
    }
    return data;
  };

  convert.documents = function(data, location){
    var documents = location["documents"]["document"];
    if (!(documents instanceof Array)){
      documents = [documents];
    }
    for (var xdocument in documents){
      var key   = xdocument+grunt.randomString(7);
      data[key] = convert.generic(new Object(), true, false);
      data[key].attachment_content_type = documents[xdocument]["attachment-content-type"];
      data[key].attachment_file_name    = documents[xdocument]["attachment-file-name"];
      data[key].attachment_file_size    = documents[xdocument]["attachment-file-size"];
      data[key].attachment_url          = documents[xdocument]["attachment-url"];
      data[key].name                    = documents[xdocument].name;
    }
    return data;
  };

  convert.gallery = function(data, location){
    data = convert.generic(new Object(), false, false);
    var gallery = location["gallery"];
    data.description = gallery.description;
    data.name = "gallery";
    return data;
  };

  convert.images = function(data, location){
    var images = location["gallery-images"]["gallery-image"];
    if (!(images instanceof Array)){
      images = [images];
    }
    for (var image in images){
      var key   = image+grunt.randomString(7);
      data[key] = convert.generic(new Object(), true, true);
      data[key].title         = images[image]["title"];
      data[key].image_file_url= images[image]["image-file-url"];
    }
    return data;
  };

  convert.sustainability = function(data, location){
    data = convert.generic(new Object(), false, false);
    var sustainability= location["sustainability"];
    data.description  = sustainability.description;
    data.image_url    = sustainability["image-url"];
    data.name         = "sustainability";
    return data;
  };

  convert.vacancies = function(data, location){
    var vacancies = location["vacancy-items"]["vacancy-item"];
    if (!(vacancies instanceof Array)){
      vacancies = [vacancies];
    }
    for (var vacancy in vacancies){
      var key   = vacancy+grunt.randomString(7);
      data[key] = convert.generic(new Object(), true, true);
      data[key].area         = vacancies[vacancy].area;
      data[key].availability = vacancies[vacancy].availability;
      data[key].description  = vacancies[vacancy].description;
      data[key].email        = vacancies[vacancy].email;
      data[key].level        = vacancies[vacancy].level;
    }
    return data;
  };

  convert.settings = function(data, settings){
    data = convert.generic(new Object(), false, false);

    data.description      = settings.details.description;
    data.name             = settings.details.name;
    data.logo_dark        = settings.theme["logo-image-url"];
    data.logo_light       = settings.theme["logo-image-white-url"];
    data.owner_logo_dark  = settings["owner-images"]["owner-image"]["image-file-url"];
    data.owner_logo_light = settings["owner-images"]["owner-images-white"]["owner-image"]["image-file-url"];
    data.tenant_access_url= settings["tenant-portal-url"];
    data.tenant_login_url = settings["tenant-login-url"];
    return data;
  };

  grunt.task.registerTask("generate:custom:data", "Generate custom data", function() {
    var location = grunt.file.readJSON(".tmp/location.json").location;
    var template = grunt.file.readJSON("libs/template.json");
    var settings = grunt.file.readJSON(".tmp/settings.json").location;
    template.data = new Object();

    template.data.building      = convert.building(new Object(), location);
    template.data.contacts      = convert.contacts(new Object(), location);
    template.data.documents     = convert.documents(new Object(), location);
    template.data.gallery       = convert.gallery(new Object(), location);
    template.data.galleryimages = convert.images(new Object(), location);
    template.data.location      = convert.location(new Object(), location);
    template.data.sustainability= convert.sustainability(new Object(), location);
    template.data.vacancies     = convert.vacancies(new Object(), location);
    template.data.settings      = convert.settings(new Object(), settings);


    grunt.log.writeln("Writing data into data/location.json");
    grunt.file.write("data/location.json", JSON.stringify(template));
    grunt.log.writeln("Write data success");
  });

  grunt.registerTask("generate-data", 'Start generate data', function(){
    if (id === null || settings === null) {
      grunt.fail.fatal("location_id, images, and settings parameter required.");
    }

    var tasks = [
      "curl:getdata",
      "convert",
      "generate:custom:data",
    ];
    grunt.task.run(tasks);
  });

  grunt.loadNpmTasks("grunt-curl");
  grunt.loadNpmTasks("grunt-convert");
  grunt.loadNpmTasks("grunt-contrib-copy");

  // NEVER REMOVE THESE LINES, OR ELSE YOUR PROJECT MAY NOT WORK
  require("./options/generatorOptions.js")(grunt);
  grunt.loadTasks("tasks");
};
