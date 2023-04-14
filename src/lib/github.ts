import { Session } from "@supabase/supabase-js";
import { Octokit } from "octokit";

const baseRootOwner = 'craftvscruft'
const repoName = 'ontology-storm-base'

const loadUserBaseRepo = async (session: Session) => {
  const octokit = new Octokit({
    auth: session.access_token,
  });
  
  const repo = await octokit.request("GET /repos/{owner}/{repo}", {
    owner: session.user.user_metadata.user_name,
    repo: repoName,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  // Might be 404 not found
  if (repo.status == 200) {
    return repo;
  }
  // Throw?
  return null;
};

const fork = async (session: Session) => {
  const octokit = new Octokit({
    auth: session.access_token,
  });
  await octokit.request('POST /repos/{owner}/{repo}/forks', {
    owner: baseRootOwner,
    repo: repoName,
    name: session.user.user_metadata.user_name,
    default_branch_only: true,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
}



export default {loadUserBaseRepo}