//
//  SwiftDataApp.swift
//  SwiftData
//
//  Created by Timothy Marland for MongoDB, Inc. on 3/15/22.
//

import SwiftUI
import MapKit

@main
struct SwiftDataApp: App {
    
    struct DataResponseModel: Codable {
        var dataSource: String
        var database: String
        var collection: String
    }
    
    struct Document: Decodable {
        let document: Shipwreck
    }
    
    struct Shipwreck: Decodable {
        let latdec: Double
        let londec: Double
    }
    
    struct AnnotatedItem: Identifiable {
        let id = UUID()
        var name: String
        var coordinate: CLLocationCoordinate2D
    }

    func getAPIData() {
        text = "Retrieving API data..."
        shipwrecks = []
        
        let url = URL(string: "https://data.mongodb-api.com/app/data-qyves/endpoint/data/beta/action/findOne")
        guard let requestUrl = url else { fatalError() }
        
        var request = URLRequest(url: requestUrl)
        
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("*", forHTTPHeaderField: "Access-Control-Request-Headers")
        request.setValue("G8fLbUNdctop9Va4uMMlin8ImvYVExqu1Yi2IMQqw2dr1qI4MEG9C7DW8pG0gonm", forHTTPHeaderField: "api-key")
         
        let newDataItem = DataResponseModel(dataSource: "BBBE", database: "sample_geospatial", collection: "shipwrecks")
        
        do {
            let jsonData = try JSONEncoder().encode(newDataItem)
            
            request.httpBody = jsonData
            
            let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
                    if let error = error {
                        print("Error: \(error)")
                        return
                    }
             
                    if let data = data, let dataString = String(data: data, encoding: .utf8) {
                        text = dataString
                        
                        let shipwreckDocument = try? JSONDecoder().decode(
                           Document.self,
                           from: data
                        )
                       
                        if let lat = shipwreckDocument?.document.latdec, let lon = shipwreckDocument?.document.londec {
                            let updatedRegion: MKCoordinateRegion = MKCoordinateRegion(center: CLLocationCoordinate2D(latitude: lat, longitude: lon), span: MKCoordinateSpan(latitudeDelta: 0.5, longitudeDelta: 0.5))
                            
                            let shipwreck = [
                                AnnotatedItem(name: "Shipwreck", coordinate: .init(latitude: lat, longitude: lon)),
                            ]
                            shipwrecks = shipwreck
                            region = updatedRegion
                        }
                    }
            }
            task.resume()
        }
        catch {
            print("Error")
        }
    }
    
    func apiHelper(endpoint: String, action: String) {
        text = action
        let url = URL(string: "http://ec2-3-135-221-191.us-east-2.compute.amazonaws.com:5000/\(endpoint)")
        guard let requestUrl = url else { fatalError() }
        
        var request = URLRequest(url: requestUrl)
        request.httpMethod = "GET"
        
        let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
                if let error = error {
                    print("Error: \(error)")
                    return
                }
                text = "retrieval complete"
            
                if let data = data, let dataString = String(data: data, encoding: .utf8) {
                    text = dataString
                }
        }
        task.resume()
    }
    
    @State private var text = ""
    @State private var region: MKCoordinateRegion = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 51.514134, longitude: -0.104236),
        span: MKCoordinateSpan(latitudeDelta: 10.075, longitudeDelta: 10.075))
    @State private var shipwrecks = [
        AnnotatedItem
    ]()
    
    var body: some Scene {
        WindowGroup {
            Image("mongologo")
                .resizable()
                .scaledToFit()
            Text("Application API")
                .padding()
            
            Button {
                Task {
                    apiHelper(endpoint: "find", action: "finding...")
                }
            } label: {
                Text("find")
            }
            Button {
                Task {
                    apiHelper(endpoint: "insert", action: "inserting...")
                }
            } label: {
                Text("insert")
            }
            Button {
                Task {
                    apiHelper(endpoint: "search", action: "searching...")
                }
            } label: {
                Text("search")
            }
                
            Text(text)
                .padding()
            
            Text("MongoDB Data API")
                .padding()
            
            Button {
                Task {
                    getAPIData()
                }
            } label: {
                Text("findOne()")
            }
                .padding()
            
            Map(coordinateRegion: $region, annotationItems: shipwrecks) { item in
                MapPin(coordinate: item.coordinate, tint: .red)
            }
                .edgesIgnoringSafeArea(.all)
        }
    }
}
