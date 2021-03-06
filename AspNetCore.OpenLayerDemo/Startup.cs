﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace AspNetCore.OpenLayerDemo
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
          
            services.AddMvc().AddRazorPagesOptions((o) => o.RootDirectory = "/src");
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.Use(async (ctx, next) =>
            {

                if (Path.GetExtension(ctx.Request.Path) == ".ts" || Path.GetExtension(ctx.Request.Path) == ".tsx")
                {

                    await ctx.Response.WriteAsync(File.ReadAllText(ctx.Request.Path.Value.Substring(1)));
                }
                else
                {
                    await next();
                }

            });


            //app.Use(async (ctx, next) =>
            //{
            //    if (ctx.Request.Query.ContainsKey("headless"))
            //    {

            //    }

            //});



            app.UseStaticFiles();
            app.UseMvc();
        }
    }
}
