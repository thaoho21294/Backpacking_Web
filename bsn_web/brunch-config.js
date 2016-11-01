exports.config = {
    // See http://brunch.io/#documentation for docs.
    files: {
        javascripts: {
            joinTo: "js/app.js"

            // To use a separate vendor.js bundle, specify two files path
            // http://brunch.io/docs/config#-files-
            //   joinTo: {
            //  "js/app.js": /^(web\/static\/js)/,
            //"js/vendor.js": /^(web\/vendor\/js)/,
            //"js/bootstrap.js": /^(node_modules\/bootstrap\/js)/
            //"js/jquery.min.js": ["node_modules/jquery/dist/jquery.min.js"]
            //  }
            //
            // To change the order of concatenation of files, explicitly mention here
            // order: {
            // before: ["js/app.js"],
            // after: ["js/view_trip.js"]
            //}
        },
        stylesheets: {
            joinTo: "css/app.css",
            order: {
                after: ["web/static/css/app.scss"] // concat app.css last
            }
        },
        templates: {
            joinTo: "js/app.js"
        }
    },

    conventions: {
        // This option sets where we should place non-css and non-js assets in.
        // By default, we set this to "/web/static/assets". Files in this directory
        // will be copied to `paths.public`, which is "priv/static" by default.
        assets: /^(web\/static\/assets)/
    },

    // Phoenix paths configuration
    paths: {
        // Dependencies and current project directories to watch
        watched: [
            "web/static",
            "test/static"
        ],

        // Where to compile files to
        public: "priv/static"
    },

    // Configure your plugins
    plugins: {
        babel: {
            // Do not use ES6 compiler in vendor code
            ignore: [/web\/static\/vendor/]
        },
        copycat: {
            "fonts": ["node_modules/bootstrap-sass/assets/fonts/bootstrap"] // copy node_modules/bootstrap-sass/assets/fonts/bootstrap/* to priv/static/fonts/
			
        },
        sass: {
            option: {
                includePaths: ["node_modules/bootstrap-sass/assets/stylesheets"], // tell sass-brunch where to look for files to @import
                precision: 8 // minimum precision required by bootstrap-sass
            }
        }

    },

    modules: {
        autoRequire: {
            "js/app.js": ["web/static/js/app"]
        }
    },

    npm: {
        enabled: true,
        whitelist: ["phoenix", "phoenix_html", "jquery", "bootstrap-sass"], // pull jquery and bootstrap-sass in as front-end assets
        //styles: {
        //    bootstrap: ['dist/css/bootstrap.min.css']
        //},
		//static: [{gmaps: 'gmaps/gmaps.js'}],
        globals: { // bootstrap-sass' JavaScript requires both '$' and 'jQuery' in global scope
            $: 'jquery',
            jQuery: 'jquery',
            bootstrap: 'bootstrap-sass', // require bootstrap-sass' JavaScript globally
        }
    }
};
