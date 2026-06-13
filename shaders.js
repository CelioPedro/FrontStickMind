(function () {
   'use strict';

   window.StickMindLegacyShaders = {
      vertexShader: `
precision highp float;

attribute float aSpeed;
attribute float aRandom;
attribute vec3  aNormal;

uniform float uTime;
uniform float uSize;
uniform vec3  uMouse;
uniform float uMouseRadius;
uniform float uMouseForce;
uniform float uBreathing;

varying float vAlpha;
varying float vRandom;
varying float vDepth;
varying float vLighting;

// Simplex 3D noise
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}

float snoise(vec3 v){
   const vec2 C=vec2(1.0/6.0,1.0/3.0);
   const vec4 D=vec4(0.0,0.5,1.0,2.0);
   vec3 i=floor(v+dot(v,C.yyy));
   vec3 x0=v-i+dot(i,C.xxx);
   vec3 g=step(x0.yzx,x0.xyz);
   vec3 l=1.0-g;
   vec3 i1=min(g.xyz,l.zxy);
   vec3 i2=max(g.xyz,l.zxy);
   vec3 x1=x0-i1+C.xxx;
   vec3 x2=x0-i2+C.yyy;
   vec3 x3=x0-D.yyy;
   i=mod289(i);
   vec4 p=permute(permute(permute(
      i.z+vec4(0.0,i1.z,i2.z,1.0))
      +i.y+vec4(0.0,i1.y,i2.y,1.0))
      +i.x+vec4(0.0,i1.x,i2.x,1.0));
   float n_=0.142857142857;
   vec3 ns=n_*D.wyz-D.xzx;
   vec4 j=p-49.0*floor(p*ns.z*ns.z);
   vec4 x_=floor(j*ns.z);
   vec4 y_=floor(j-7.0*x_);
   vec4 x=x_*ns.x+ns.yyyy;
   vec4 y=y_*ns.x+ns.yyyy;
   vec4 h=1.0-abs(x)-abs(y);
   vec4 b0=vec4(x.xy,y.xy);
   vec4 b1=vec4(x.zw,y.zw);
   vec4 s0=floor(b0)*2.0+1.0;
   vec4 s1=floor(b1)*2.0+1.0;
   vec4 sh=-step(h,vec4(0.0));
   vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
   vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
   vec3 p0=vec3(a0.xy,h.x);
   vec3 p1=vec3(a0.zw,h.y);
   vec3 p2=vec3(a1.xy,h.z);
   vec3 p3=vec3(a1.zw,h.w);
   vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
   p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
   vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
   m=m*m;
   return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

void main(){
   vec3 pos=position;

   // Breathing
   float breathPhase=uTime*1.5;
   float breathCycle=sin(breathPhase)*0.5+0.5;
   float breathScale=1.0+(breathCycle*uBreathing);
   pos*=breathScale;
   pos.y+=breathCycle*2.5;

   // Mouse repulsion
   float distToMouse=distance(pos,uMouse);
   if(distToMouse<uMouseRadius){
      float f=1.0-distToMouse/uMouseRadius;
      f=f*f*f;
      vec3 dir=normalize(pos-uMouse);
      pos+=dir*uMouseForce*f*25.0;
   }

   vec4 mvPosition=modelViewMatrix*vec4(pos,1.0);

   // Backface culling - tight cutoff for corporate look
   vec3 worldNormal=normalize(mat3(modelViewMatrix)*aNormal);
   float facing=dot(worldNormal,vec3(0.0,0.0,1.0));
   float backfaceFade=smoothstep(-0.05,0.15,facing);

   // Depth occlusion
   float zFade=smoothstep(-8.0,8.0,position.z);
   float rimFade=smoothstep(0.0,0.35,facing);

   // Directional light
   vec3 lightDir=normalize(vec3(-0.6,0.4,0.8));
   float diffuse=max(dot(worldNormal,lightDir),0.0);
   vLighting=0.25+diffuse*0.75;

   // Combine
   vAlpha=zFade*backfaceFade*(0.4+0.6*rimFade);
   vRandom=aRandom;
   vDepth=-mvPosition.z;

   // Size attenuation
   float sizeAtten=300.0/-mvPosition.z;
   float randomSize=uSize*(0.8+aRandom*0.4);
   gl_PointSize=randomSize*sizeAtten;
   gl_PointSize=clamp(gl_PointSize,0.5,35.0);

   if(vAlpha<0.005) gl_PointSize=0.0;

   gl_Position=projectionMatrix*mvPosition;
}
`,

      fragmentShader: `
precision highp float;

uniform float uTime;

varying float vAlpha;
varying float vRandom;
varying float vDepth;
varying float vLighting;

void main(){
   if(vAlpha<0.01) discard;

   // Matte core + soft glow
   float r=distance(gl_PointCoord,vec2(0.5));
   float core=smoothstep(0.3,0.05,r);
   float glow=smoothstep(0.5,0.15,r);
   float mask=core*0.85+glow*0.35;
   if(mask<0.01) discard;

   // Soft lavender gradient
   vec3 deepPurple=vec3(0.12,0.06,0.22);
   vec3 lavenderNeon=vec3(0.65,0.52,0.85);
   vec3 hotGlow=vec3(0.88,0.78,0.95);

   float brightness=0.55+vRandom*0.15;
   vec3 color=mix(deepPurple,lavenderNeon*brightness*1.6,vLighting);
   color=mix(color,hotGlow,core*0.4*vLighting);
   color*=(0.8+core*0.5);

   float finalAlpha=mask*vAlpha;
   finalAlpha*=smoothstep(600.0,200.0,vDepth);

   gl_FragColor=vec4(color,finalAlpha);
}
`
   };
})();
