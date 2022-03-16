//
//  SwiftDataApp.swift
//  SwiftData
//
//  Created by Timothy Marland for MongoDB, Inc. on 3/15/22.
//

import SwiftUI

@main
struct SwiftDataApp: App {
    
    struct DataResponseModel: Codable {
        var dataSource: String
        var database: String
        var collection: String
    }

    func getAPIData() {
        text = "Retrieving API data..."
        
        // Prepare URL
        let url = URL(string: "https://data.mongodb-api.com/app/data-qyves/endpoint/data/beta/action/findOne")
        guard let requestUrl = url else { fatalError() }
        // Prepare URL Request Object
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
                    }
            }
            task.resume()
        }
        catch {
            print("Error")
        }
    }
    
    var labeltext = "findOne()"
      
    @State private var text = ""
    
    var body: some Scene {
        WindowGroup {
            Image("mongologo")
                .resizable()
                .scaledToFit()
            Text("MongoDB Data API Test")
                .padding()
            Button {
                Task {
                    getAPIData()
                }
            } label: {
                Text(labeltext)
            }
                .padding()
            Text(text)
                .padding()
        }
    }
}
