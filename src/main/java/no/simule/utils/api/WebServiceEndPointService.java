/**
 * WebServiceEndPointService.java
 * <p>
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package no.simule.utils.api;

public interface WebServiceEndPointService extends javax.xml.rpc.Service {
    public String getWebServiceEndPointPortAddress();

    public WebServiceEndPoint getWebServiceEndPointPort() throws javax.xml.rpc.ServiceException;

    public WebServiceEndPoint getWebServiceEndPointPort(java.net.URL portAddress) throws javax.xml.rpc.ServiceException;
}
