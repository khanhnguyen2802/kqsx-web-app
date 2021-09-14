package vn.ssdc.vnpt.vts.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@Configuration
public class ResourceConfig extends WebMvcConfigurerAdapter {
    // allow truy cập file upload
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry resgistry){
        resgistry.addResourceHandler("/attachment/images/**").addResourceLocations("file:attachment/images/");
    }
}
