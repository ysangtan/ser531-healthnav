"""
Manual repository creation script for GraphDB.
Uses the GraphDB Workbench REST API to create a repository.
"""

import requests
import sys

def create_repository_via_workbench():
    """Create repository using GraphDB Workbench API."""

    # GraphDB 10.x uses a different config format
    config = """
# Sesame configuration template for a GraphDB Free repository
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix rep: <http://www.openrdf.org/config/repository#>.
@prefix sr: <http://www.openrdf.org/config/repository/sail#>.
@prefix sail: <http://www.openrdf.org/config/sail#>.
@prefix graphdb: <http://www.ontotext.com/config/graphdb#>.

[] a rep:Repository ;
    rep:repositoryID "healthnav" ;
    rdfs:label "Healthcare Navigator Knowledge Graph" ;
    rep:repositoryImpl [
        rep:repositoryType "graphdb:SailRepository" ;
        sr:sailImpl [
            sail:sailType "graphdb:Sail" ;
            graphdb:ruleset "rdfsplus-optimized" ;
            graphdb:read-only "false" ;
        ]
    ] .
"""

    # Try the repositories endpoint with multipart form
    try:
        files = {'config': ('repo-config.ttl', config, 'text/turtle')}
        response = requests.post(
            'http://localhost:7200/rest/repositories',
            files=files
        )

        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")

        if response.status_code in [200, 201]:
            print("\n✓ Repository 'healthnav' created successfully!")
            return True
        else:
            print(f"\n✗ Failed to create repository")

            # Try alternative: Write config to file and use curl
            print("\n" + "="*60)
            print("Alternative: Use curl command:")
            print("="*60)
            print("""
curl -X POST http://localhost:7200/rest/repositories \\
  -H "Content-Type: multipart/form-data" \\
  -F "config=@-;type=text/turtle" << 'EOF'
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix rep: <http://www.openrdf.org/config/repository#>.
@prefix sr: <http://www.openrdf.org/config/repository/sail#>.
@prefix sail: <http://www.openrdf.org/config/sail#>.
@prefix graphdb: <http://www.ontotext.com/config/graphdb#>.

[] a rep:Repository ;
    rep:repositoryID "healthnav" ;
    rdfs:label "Healthcare Navigator Knowledge Graph" ;
    rep:repositoryImpl [
        rep:repositoryType "graphdb:SailRepository" ;
        sr:sailImpl [
            sail:sailType "graphdb:Sail" ;
            graphdb:ruleset "rdfsplus-optimized" ;
        ]
    ] .
EOF
""")
            return False

    except Exception as e:
        print(f"Error: {e}")
        return False

def check_repository_exists():
    """Check if repository exists."""
    try:
        response = requests.get('http://localhost:7200/rest/repositories')
        repos = response.json()

        for repo in repos:
            if repo['id'] == 'healthnav':
                print("✓ Repository 'healthnav' already exists!")
                return True

        print("Repository 'healthnav' does not exist yet.")
        return False

    except Exception as e:
        print(f"Error checking repositories: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("GraphDB Repository Creation")
    print("=" * 60)
    print()

    # Check if repository exists
    if check_repository_exists():
        print("\nNo action needed - repository already exists!")
        sys.exit(0)

    print("\nAttempting to create repository...")
    if create_repository_via_workbench():
        sys.exit(0)
    else:
        print("\n" + "=" * 60)
        print("Manual creation required")
        print("=" * 60)
        print("\nPlease create the repository manually:")
        print("1. Open: http://localhost:7200")
        print("2. Go to: Setup → Repositories")
        print("3. Click: 'Create new repository'")
        print("4. Select: 'GraphDB Repository'")
        print("5. Repository ID: healthnav")
        print("6. Title: Healthcare Navigator Knowledge Graph")
        print("7. Ruleset: RDFS-Plus (Optimized)")
        print("8. Click: Create")
        print()
        print("Then run: python ops/seed_graphdb.py")
        print("=" * 60)
        sys.exit(1)
