private void fileDownload()
{
    try
    {
        using (WebClient client = new WebClient())
        {
            string response = client.DownloadString("http://localhost/advertising/api.php?msg=whatsupdoc");
            JArray json = JArray.Parse(response);
            int[] array = new int[json.Count];
            int index = 0;
            for (int i = 0; i < json.Count; i++)
            {
                array[i] = 0;
            }
            using (var conn = new SQLiteConnection(@"Data Source=" + Path.Combine(BaseDir, @"Database\mediadatabase.db")))
            {
                conn.Open();
                using (var cmd = new SQLiteCommand(conn))
                {
                    using (var transaction = conn.BeginTransaction())
                    {
                        cmd.CommandText = @"SELECT name,version from doc";
                        SQLiteDataReader reader1 = cmd.ExecuteReader();
                        if (!reader1.HasRows)
                        {
                            hasRow = false;
                        }
                        else
                        {
                            while (reader1.Read())
                            {
                                string name = reader1["name"].ToString();
                                int version = Convert.ToInt32(reader1["version"].ToString());
                                string newName = "";
                                int newID = 0;
                                int newVersion = 0;
                                index = 0;
                                foreach (JObject obj in json)
                                {
                                    newName = obj["name"].ToString();
                                    newID = Convert.ToInt32(obj["id"].ToString());
                                    newVersion = Convert.ToInt32(obj["version"].ToString());
                                    if (name == obj["name"].ToString())
                                    {
                                        array[index] = Convert.ToInt32(obj["id"].ToString());
                                        if (version < Convert.ToInt32(obj["version"].ToString()))
                                        {
                                            File.Delete(@"Data\File\" + obj["name"]);
                                            client.DownloadFileTaskAsync(new Uri("http://localhost/advertisng/file/" + obj["name"] + "?timestamp=" + DateTime.Now.ToString()), @"Data\File\" + obj["name"]);
                                            UpdateData.Add(new content() { id = Convert.ToInt32(obj["id"].ToString()), name = obj["name"].ToString(), version = Convert.ToInt32(obj["version"].ToString()) });
                                        }
                                        else if (Convert.ToInt32(obj["version"].ToString()) == 0)
                                        {
                                            try
                                            {
                                                File.Delete(@"Data\File\" + obj["name"]);
                                                DeleteData.Add(new content() { id = Convert.ToInt32(obj["id"].ToString()), name = obj["name"].ToString(), version = Convert.ToInt32(obj["version"].ToString()) });
                                            }
                                            catch (Exception)
                                            {

                                            }
                                        }
                                    }
                                    index++;
                                }
                            }
                            for (int i = 0; i < json.Count; i++)
                            {
                                if (array[i] == 0)
                                {
                                    NewData.Add(new content() { id = Convert.ToInt32(json[i]["id"].ToString()), name = json[i]["name"].ToString(), version = Convert.ToInt32(json[i]["version"].ToString()) });
                                }
                            }
                            Setup();
                        }
                    }
                }
                if (newData.Count > 0)
                {
                    foreach (content obj in NewData)
                    {
                        using (var cmd = new SQLiteCommand(conn))
                        {
                            using (var transaction = conn.BeginTransaction())
                            {
                                cmd.CommandText = @"INSERT INTO doc (name,version) VALUES(@name,@version)";
                                cmd.Parameters.AddWithValue("@name", obj.name);
                                cmd.Parameters.AddWithValue("@version", obj.version);
                                cmd.ExecuteNonQuery();
                                transaction.Commit();
                                client.DownloadFileTaskAsync(new Uri("http://localhost/advertising/file/" + obj.name + "?timestamp=" + DateTime.Now.ToString()), @"Data\File\" + obj.name);
                            }
                        }
                    }
                    Setup();
                    NewData.Clear();
                }
                if (DeleteData.Count > 0)
                {
                    foreach (content obj in DeleteData)
                    {
                        using (var cmd = new SQLiteCommand(conn))
                        {
                            using (var transaction = conn.BeginTransaction())
                            {

                                cmd.CommandText = @"UPDATE doc set version=@version where id=@id";
                                cmd.Parameters.AddWithValue("@id", obj.id);
                                cmd.Parameters.AddWithValue("@version", obj.version);
                                cmd.ExecuteNonQuery();
                                transaction.Commit();
                            }
                        }
                    }
                    Setup();
                    DeleteData.Clear();
                }
                if (UpdateData.Count > 0)
                {
                    foreach (content obj in UpdateData)
                    {
                        using (var cmd = new SQLiteCommand(conn))
                        {
                            using (var transaction = conn.BeginTransaction())
                            {

                                cmd.CommandText = @"UPDATE doc set version=@version where id=@id";
                                cmd.Parameters.AddWithValue("@id", obj.id);
                                cmd.Parameters.AddWithValue("@version", obj.version);
                                cmd.ExecuteNonQuery();
                                transaction.Commit();
                            }
                        }
                    }
                    Setup();
                    UpdateData.Clear();
                }
                if (!hasRow)
                {
                    foreach (JObject obj in json)
                    {
                        using (var cmd = new SQLiteCommand(conn))
                        {
                            using (var transaction = conn.BeginTransaction())
                            {

                                cmd.CommandText = @"INSERT INTO doc (name,version) VALUES(@name,@version)";
                                cmd.Parameters.AddWithValue("@name", obj["name"].ToString());
                                cmd.Parameters.AddWithValue("@version", Convert.ToInt32(obj["version"].ToString()));
                                cmd.ExecuteNonQuery();
                                transaction.Commit();
                                client.DownloadFileTaskAsync(new Uri("http://localhost/advertising/file/" + obj["name"] + "?timestamp=" + DateTime.Now.ToString()), @"Data\File\" + obj["name"]);
                            }
                        }
                    }
                    hasRow = true;
                    Setup();
                }
                conn.Close();
            }

        }
    }
    catch (Exception)
    {

    }
}
